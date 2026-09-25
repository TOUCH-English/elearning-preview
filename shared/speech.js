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
  var SAME = { "i'm": "i am", "it's": "it is", "don't": "do not", "doesn't": "does not", "can't": "cannot", "what's": "what is", "i'd": "i would", "i've": "i have", "that's": "that is", "he's": "he is", "she's": "she is", "we're": "we are", "they're": "they are", "you're": "you are", "isn't": "is not", "aren't": "are not" };
  function near(a, b) { return a === b || (a.length >= 4 && lev(a, b) <= 1); }

  function check(target, heard) {
    var names = ((global.TouchVoice && global.TouchVoice.names) || []).map(function (n) { return norm(n); }).join(" ").split(" ").filter(Boolean);
    var tw = String(target || "").split(/\s+/).filter(function (w) { return /[A-Za-z0-9]/.test(w); });
    var best = null;
    (heard && heard.length ? heard : [""]).forEach(function (h) {
      var hw = words(Object.keys(SAME).reduce(function (s, k) { return s.replace(new RegExp("\\b" + k + "\\b", "g"), SAME[k]); }, norm(h)));
      var used = [];
      var res = tw.map(function (raw) {
        var w = norm(raw);
        var parts = (SAME[w] || w).split(" ");
        if (!w || parts.every(function (p) { return names.indexOf(p) >= 0; })) return { w: raw, ok: true };
        var ok = parts.every(function (p) {
          for (var i = 0; i < hw.length; i++) if (!used[i] && near(p, hw[i])) { used[i] = true; return true; }
          return false;
        });
        return { w: raw, ok: ok };
      });
      var n = res.filter(function (r) { return r.ok; }).length;
      if (!best || n > best.ok) best = { words: res, ok: n, total: res.length };
    });
    // passes when at most one word in five did not come through
    best.pass = best.total === 0 || best.ok / best.total >= 0.8;
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
  var finisher = null;
  function listen(opt) {
    opt = opt || {};
    return new Promise(function (resolve, reject) {
      if (!Rec) return reject(new Error("unavailable"));
      stop();
      var r = new Rec();
      r.lang = "en-US";
      r.interimResults = true;
      r.maxAlternatives = 5;
      r.continuous = false;
      current = r;
      var finals = [], interim = "", done = false, started = false, settle = null;
      var finish = function (err) {
        if (done) return;
        done = true;
        clearTimeout(t); clearTimeout(settle);
        current = null; finisher = null;
        var got = finals.length ? finals : (interim ? [interim] : []);
        if (err && !got.length) reject(err); else resolve(got);
      };
      finisher = function () { try { r.stop(); } catch (e) {} settle = setTimeout(function () { finish(); }, 700); };
      var t = setTimeout(function () { finisher && finisher(); }, opt.maxMs || 8000);
      var begin = function () { if (!started) { started = true; if (opt.onStart) opt.onStart(); } };
      r.onaudiostart = begin;
      r.onstart = function () { if (!("onaudiostart" in r)) begin(); };
      r.onresult = function (e) {
        begin();
        var live = "", anyFinal = false;
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var res = e.results[i];
          if (res.isFinal) {
            anyFinal = true;
            for (var j = 0; j < res.length; j++) if (finals.indexOf(res[j].transcript) < 0) finals.push(res[j].transcript);
          } else live += res[0].transcript;
        }
        interim = live || interim;
        if (opt.onHear) opt.onHear(finals[0] || interim);
        if (anyFinal) { clearTimeout(settle); settle = setTimeout(function () { try { r.stop(); } catch (x) {} finish(); }, 350); }
      };
      r.onerror = function (e) { finish(new Error(e && e.error || "error")); };   // "not-allowed", "no-speech", …
      r.onend = function () { finish(); };
      try { r.start(); } catch (e) { finish(e); }
    });
  }

  /* Stop now and keep what was heard (the learner tapped the mic again). */
  function finishNow() { if (finisher) finisher(); }

  function stop() { if (current) { try { current.abort(); } catch (e) {} current = null; } }

  /* Text as the checks compare it: lower case, no punctuation, contractions spelled out
     ("It's 9 o'clock" -> "it is 9 o'clock"), so free answers can be matched on phrases. */
  function normalize(text) {
    var t = norm(text);
    Object.keys(SAME).forEach(function (k) { t = t.replace(new RegExp("\\b" + k.replace("'", "'") + "\\b", "g"), SAME[k]); });
    // Chrome writes "eight o'clock" as "8:00" (norm has already turned it into "8 00")
    return t.replace(/\bmister\b/g, "mr").replace(/\b(\d{1,2}) 00\b/g, "$1 o'clock");
  }

  global.TouchSpeech = { available: !!Rec, listen: listen, finish: finishNow, check: check, stop: stop, normalize: normalize };
})(typeof globalThis !== "undefined" ? globalThis : window);
