/* =============================================================================
   TouchSpeech — hear what the learner said, and mark the words that did not come through
   -----------------------------------------------------------------------------
   ✅ Marco 2026-09-25, A: 「跟着说」 uses the phone's own speech recognition (the
   same one behind the keyboard's dictation; the audio goes to Apple or Google to
   be turned into text, as with dictation) to show which word was not clear.
   Why: learners who only play their own recording back find about half of their
   errors (Dlaska & Krekeler 2008); recognition with explicit feedback works
   (Ngo, Chen & Lai 2023, g = 0.69).

   It marks words, it does not grade accents: a word counts when the recogniser
   heard it (or something one letter away, for words of four letters or more),
   so a Malaysian accent that is perfectly understandable passes. The learner's
   own name is never marked (TouchVoice.names): recognisers spell names freely.

   Where the browser has no recognition (some Android browsers, older iPhones),
   `available` is false and the course falls back to record-and-play-back.

     TouchSpeech.available                                   // boolean
     TouchSpeech.listen({ onStart, onHear, maxMs }) -> Promise<string[]>   // what it heard, best first
     TouchSpeech.finish()                     // stop now, keep what was heard
     listen({ record: true, onRecorded(blob) }) // also record, to hear yourself back; noRecording() turns it off here
     TouchSpeech.check(target, heard)  -> { words: [{ w, ok }], ok: n, total: n, pass: bool }
     TouchSpeech.stop()
     TouchSpeech.normalize(text) -> string    // lower case, no punctuation, contractions spelled out
============================================================================= */
(function (global) {
  "use strict";
  if (global.TouchSpeech) return;

  var Rec = global.SpeechRecognition || global.webkitSpeechRecognition;
  var current = null;

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function words(s) { return norm(s).split(" ").filter(Boolean); }

  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }

  // the same word, near enough: exact, or one letter off for words of four letters or more,
  // and the usual contractions either way round
  var SAME = { "i'm": "i am", "it's": "it is", "don't": "do not", "doesn't": "does not", "can't": "cannot", "what's": "what is", "i'd": "i would", "i've": "i have", "that's": "that is", "he's": "he is", "she's": "she is", "we're": "we are", "they're": "they are", "you're": "you are", "isn't": "is not", "aren't": "are not",
    "i'll": "i will", "we'll": "we will", "you'll": "you will", "he'll": "he will", "she'll": "she will", "it'll": "it will", "they'll": "they will", "won't": "will not", "we've": "we have", "you've": "you have", "didn't": "did not", "wasn't": "was not", "couldn't": "could not", "shouldn't": "should not",
    "name's": "name is", "there's": "there is", "here's": "here is", "who's": "who is", "where's": "where is", "how's": "how is", "let's": "let us" };
  /* The people in the course sentences. Recognisers spell names freely ("Siti" comes back
     as "city", "Kumar" as "Kuma"), so, like the learner's own name, a cast name is never
     marked — it is not an English word the learner can say wrong. */
  var CAST = ["siti", "kumar", "mei", "ling", "tan", "ali", "amy"];
  /* Near enough to count as the same word: exact, or — for words of five letters or more —
     one letter off, which covers accent and recogniser spelling. But never a difference
     of a grammar ending: "visit" for "visited", "work" for "works", "like" for "liked" are
     the very mistakes a lesson teaches, so they must not pass as "the same word"
     (walkthrough 2026-09-25: "I visit my parents" was praised in the past-tense lesson). */
  var ENDS = ["s", "es", "d", "ed", "ing"];
  function twinOf(long, short) {        // long = short + a grammar ending (incl. like→liked, live→living, study→studied)
    return ENDS.some(function (e) { return long === short + e; }) ||
      (/e$/.test(short) && (long === short.slice(0, -1) + "ing" || long === short.slice(0, -1) + "ed")) ||
      (/y$/.test(short) && (long === short.slice(0, -1) + "ies" || long === short.slice(0, -1) + "ied"));
  }
  function grammarTwin(a, b) { return a !== b && (twinOf(a, b) || twinOf(b, a)); }
  function near(a, b) { return a === b || (a.length >= 5 && !grammarTwin(a, b) && lev(a, b) <= 1); }

  /* The small words that carry the grammar — leave one out and the sentence is wrong
     ("I good", "I twenty-eight years old", "I from Ipoh and I work…"). Every one of them in
     the model must be heard. Articles are not in the list: a missing "a"/"the" is the one
     slip a long, otherwise right sentence may keep. */
  var CRITICAL = ["am", "is", "are", "was", "were", "be", "been", "do", "does", "did", "have", "has", "had",
    "can", "could", "will", "would", "should", "not", "never", "and", "but", "because", "so", "or", "then", "to",
    "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "our", "their"];

  /* Which words of the model came through, IN ORDER (the longest ordered match between the
     model and what was heard): "I come from Kulai and I live in Kuantan" for "…from
     Kuantan… in Kulai" is not the same sentence, even with every word present. A name
     matches any one word said in its place (recognisers spell names freely). Passes when
     every grammar word is there, no word was replaced by a grammar twin, and at most one
     other word is missing (none, for a sentence of five words or fewer). */
  function check(target, heard) {
    var names = ((global.TouchVoice && global.TouchVoice.names) || []).map(function (n) { return norm(n); }).join(" ").split(" ").filter(Boolean).concat(CAST);
    var tw = String(target || "").split(/\s+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); });
    var best = null;
    (heard && heard.length ? heard : [""]).forEach(function (h) {
      var hw = words(Object.keys(SAME).reduce(function (s, k) { return s.replace(new RegExp("\\b" + k + "\\b", "g"), SAME[k]); }, norm(h)).replace(/\bmister\b/g, "mr").replace(/\bmissus\b|\bmisses\b/g, "mrs"));
      // the model as single words, each remembering which displayed word it belongs to
      var tv = [];
      tw.forEach(function (raw, ri) {
        var w = norm(raw); if (!w) return;
        var parts = (SAME[w] || w).split(" ");
        var isName = parts.every(function (p) { return names.indexOf(p) >= 0; });
        parts.forEach(function (p) { tv.push({ p: p, ri: ri, name: isName }); });
      });
      var n = tv.length, m = hw.length, i, j;
      var eq = function (a, b) { return near(a.p, b) || (a.name && !!b); };
      var L = []; for (i = 0; i <= n; i++) { L[i] = []; for (j = 0; j <= m; j++) L[i][j] = 0; }
      for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--)
        L[i][j] = eq(tv[i], hw[j]) ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
      var hit = [], usedH = [];
      for (i = 0, j = 0; i < n && j < m;) {
        if (eq(tv[i], hw[j]) && L[i][j] === 1 + L[i + 1][j + 1]) { hit[i] = true; usedH[j] = true; i++; j++; }
        else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
      }
      var leftover = hw.filter(function (_, k) { return !usedH[k]; });
      var miss = [], why = "";
      tv.forEach(function (t, k) {
        if (hit[k]) return;
        miss.push(t.p);
        if (leftover.some(function (x) { return grammarTwin(t.p, x); })) why = why || "form:" + t.p;
        else if (CRITICAL.indexOf(t.p) >= 0) why = why || "small:" + t.p;
      });
      var res = tw.map(function (raw, ri) {
        var mine = tv.filter(function (t) { return t.ri === ri; });
        var ok = !mine.length || mine.every(function (t) { return hit[tv.indexOf(t)]; });
        return { w: raw, ok: ok };
      });
      var okN = n - miss.length;
      var allowed = n <= 5 ? 0 : 1;
      var cand = { words: res, ok: okN, total: n, miss: miss, why: why, pass: !why && miss.length <= allowed };
      if (!best || (cand.pass && !best.pass) || (cand.pass === best.pass && okN > best.ok)) best = cand;
    });
    return best;
  }

  /* Listening, the way a phone needs it (Marco 2026-09-25 on his iPhone: 「开麦好像录不到
     我的声音…关麦…一直关不到…慢一拍」):
     - the recogniser takes a moment to start after the tap; onStart fires only when it is
       really taking sound (onaudiostart), so the screen says "speak now" at the right time;
     - words arrive live (interim results) through onHear, so the learner sees it hearing;
     - it stops by itself as soon as a phrase is final, instead of waiting for the phone to
       decide the learner is silent, which on iPhone can take several seconds;
     - finish() stops at once and keeps what was heard so far (a second tap on the mic). */
  /* Hearing yourself back (Marco 2026-09-25: 「可不可以…听回自己的声音」). The recogniser
     keeps no audio, so with opt.record the microphone is also recorded (MediaRecorder)
     while the phone recognises; opt.onRecorded(blob) gets it when listening ends. Some
     phones cannot give the microphone to both at once (the recogniser then reports
     "audio-capture" or never starts): noRecording() switches recording off on this
     device for good, and listening goes on as before. */
  var NOREC = "touch-speech-norecord";
  /* Never on iPhone / iPad: tried there on 2026-09-25 and the second recognition was
     aborted, listening started late and his voice came back twice — the phone will not
     share the microphone. There the course offers a separate record-and-play instead. */
  var IOS = /iP(hone|ad|od)/.test(global.navigator && global.navigator.userAgent || "") ||
    (/Macintosh/.test(global.navigator && global.navigator.userAgent || "") && (global.navigator.maxTouchPoints || 0) > 1);
  function canRecord() {
    if (IOS) return false;
    try { if (global.localStorage && global.localStorage.getItem(NOREC)) return false; } catch (e) {}
    return !!(global.MediaRecorder && global.navigator && global.navigator.mediaDevices && global.navigator.mediaDevices.getUserMedia);
  }
  function noRecording() { try { global.localStorage.setItem(NOREC, "1"); } catch (e) {} }

  var finisher = null, killer = null;

  /* Never two sessions at once: if the last one has not ended, ask it to stop and wait
     up to a second for its end. Then a FRESH recogniser each time — a reused one keeps
     whatever state the last session left behind. (Marco's iPhone, 2026-09-25: the first
     try works and the second comes back "aborted". A single reused recogniser was tried
     first and did not help; the real cause was <audio> playing between the tries, which
     shared/voice.js now avoids on iPhone.) R is the latest one. */
  var R = null, active = false, waiters = [];
  function recogniser(long) {
    R = new Rec();
    R.lang = "en-US";
    R.interimResults = true;
    R.maxAlternatives = long ? 1 : 5;
    R.continuous = !!long;
    return R;
  }
  function whenIdle() {
    if (!active) return Promise.resolve();
    return new Promise(function (res) {
      waiters.push(res);
      try { R.stop(); } catch (e) {}
      setTimeout(function () { active = false; flushIdle(); }, 1000);
    });
  }
  function flushIdle() { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); }

  /* What the phone's audio is for (Safari 16.4+): "play-and-record" while listening, and
     back to "auto" when it ends. Not "playback": a session left in playback is exactly
     what stops the next recognition getting the microphone on iPhone. */
  function audioFor(kind) {
    try { if (global.navigator && global.navigator.audioSession) global.navigator.audioSession.type = kind; } catch (e) {}
  }

  function listen(opt) {
    opt = opt || {};
    var log = opt.log || function () {};
    var t0 = Date.now();
    var mark = function (what) { log(what + " " + ((Date.now() - t0) / 1000).toFixed(1) + "s"); };
    return new Promise(function (resolve, reject) {
      if (!Rec) return reject(new Error("unavailable"));
      if (current) { try { current = null; } catch (e) {} }
      var go = function () {
        /* opt.long: several sentences in one go (a Boss mission). The phone keeps listening
           through pauses until the learner taps again (or maxMs), and what was heard is
           joined into one text instead of being offered as alternatives. */
        var long = !!opt.long, parts = [];
        var r = recogniser(long);
        current = r;
        var finals = [], interim = "", done = false, started = false, settle = null;
        var mr = null, stream = null, chunks = [], wantRec = !!opt.record && canRecord();
        var stopRec = function () {
          if (mr && mr.state !== "inactive") { try { mr.stop(); } catch (e) {} }
          else if (stream) { try { stream.getTracks().forEach(function (tr) { tr.stop(); }); } catch (e) {} }
        };
        var finish = function (err) {
          if (done) return;
          done = true;
          stopRec();
          clearTimeout(t); clearTimeout(settle);
          if (current === r) current = null;
          finisher = null; killer = null;
          audioFor("auto");
          var got = long ? ((parts.join(" ") + " " + interim).trim() ? [(parts.filter(Boolean).join(" ") + (interim ? " " + interim : "")).trim()] : [])
            : finals.length ? finals : (interim ? [interim] : []);
          mark(err ? "error:" + err.message : "done:" + got.length);
          if (err && !got.length) reject(err); else resolve(got);
        };
        finisher = function () { mark("stop"); try { r.stop(); } catch (e) {} settle = setTimeout(function () { finish(); }, 700); };
        // stop(): end this listen now, even if the phone never sends its end event
        killer = function () { try { r.abort(); } catch (e) {} finish(new Error("aborted")); };
        var t = setTimeout(function () { finisher && finisher(); }, opt.maxMs || 8000);
        var begin = function () { if (!started) { started = true; mark("listening"); if (opt.onStart) opt.onStart(); } };
        r.onaudiostart = begin;
        r.onstart = function () { mark("start"); if (!("onaudiostart" in r)) begin(); };
        r.onresult = function (e) {
          begin();
          var live = "", anyFinal = false;
          for (var i = e.resultIndex; i < e.results.length; i++) {
            var res = e.results[i];
            if (res.isFinal && long) { parts[i] = res[0].transcript; interim = ""; continue; }
            if (res.isFinal) {
              anyFinal = true;
              for (var j = 0; j < res.length; j++) if (finals.indexOf(res[j].transcript) < 0) finals.push(res[j].transcript);
            } else live += res[0].transcript;
          }
          interim = live || interim;
          if (long) interim = live;
          if (opt.onHear) opt.onHear(long ? (parts.filter(Boolean).join(" ") + " " + interim).trim() : (finals[0] || interim));
          if (anyFinal) { clearTimeout(settle); settle = setTimeout(function () { try { r.stop(); } catch (x) {} finish(); }, 350); }
        };
        r.onerror = function (e) { mark("err:" + (e && e.error) + (e && e.message ? "(" + e.message + ")" : "")); finish(new Error(e && e.error || "error")); };   // "not-allowed", "no-speech", …
        r.onend = function () { mark("end"); active = false; flushIdle(); finish(); };
        audioFor("play-and-record");
        try { active = true; r.start(); mark("tap"); } catch (e) { active = false; mark("start-failed"); finish(e); }
        // recording starts after the recogniser, so the recogniser keeps the tap's user gesture
        if (wantRec && !done) {
          global.navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
            stream = st;
            if (done) { stopRec(); return; }
            try {
              mr = new global.MediaRecorder(st);
              mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
              mr.onstop = function () {
                try { st.getTracks().forEach(function (tr) { tr.stop(); }); } catch (e) {}
                if (chunks.length && opt.onRecorded) opt.onRecorded(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
              };
              mr.start();
            } catch (e) { stopRec(); }
          }, function () {});
        }
      };
      if (active) { mark("waiting-for-last"); whenIdle().then(go); } else go();
    });
  }

  /* Stop now and keep what was heard (the learner tapped the mic again). */
  function finishNow() { if (finisher) finisher(); }

  function stop() {
    var k = killer;
    current = null;
    if (k) k();
  }

  /* Text as the checks compare it: lower case, no punctuation, contractions spelled out
     ("It's 9 o'clock" -> "it is 9 o'clock"), so free answers can be matched on phrases. */
  function normalize(text) {
    var t = norm(text);
    Object.keys(SAME).forEach(function (k) { t = t.replace(new RegExp("\\b" + k.replace("'", "'") + "\\b", "g"), SAME[k]); });
    // Chrome writes "eight o'clock" as "8:00" (norm has already turned it into "8 00")
    return t.replace(/\bmister\b/g, "mr").replace(/\b(\d{1,2}) 00\b/g, "$1 o'clock");
  }

  global.TouchSpeech = { available: !!Rec, listen: listen, finish: finishNow, check: check, stop: stop, normalize: normalize, canRecord: canRecord, noRecording: noRecording, audioFor: audioFor };
})(typeof globalThis !== "undefined" ? globalThis : window);
