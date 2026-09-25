/* =============================================================================
   TOUCH E-learning — 发音播放层  (shared/voice.js)
   -----------------------------------------------------------------------------
   为什么有这个档案：

   原本发音是浏览器内建的语音合成（speechSynthesis）。它不是我们挑的声音 ——
   是学生手机自己的声音，每台不一样，Android 上特别机械。
   所以课程里写死了「超过 3 个字就不念」，学生听得到单字，听不到例句。

   现在改成：事先用真人般的 AI 语音生成 mp3，跟课程一起带着走。
   播放的时候优先播 mp3；万一某一条没有音档（新增内容还没生成、或档案漏了），
   自动退回浏览器语音 —— 绝对不能因为缺一个档案就变成没声音。

   -----------------------------------------------------------------------------
   用法（放在主 script 之前）：

       <script src="../../shared/voice.js"></script>

       TouchVoice.say("hometown")                  // 正常速
       TouchVoice.say(sentence, { slow: true })    // 慢速（0.75 倍，音高不变）
       TouchVoice.say(txt, { btn: el })            // 播放时给按钮加 .playing
       TouchVoice.stop()

   慢速为什么用播放速率、不另外生成一份慢的音档：
   同一份 mp3 就能正常速也能慢速，档案少一半，而且学生可以自己选。
   浏览器慢放会保持音高，不会变成低沉的怪声。

   -----------------------------------------------------------------------------
   档名怎么来的：text → key()，跟 tools/build-audio.mjs 用同一套算法，
   两边算出来一定一样。改这个函式的话，两边要一起改，否则全部音档都找不到。
============================================================================= */

(function (global) {
  "use strict";

  var doc = global.document;

  /* 音档放哪里：从这个 script 自己的位置推算（shared/voice.js → shared/audio/）。
     这样不管是课程（courses/x/）、启动页（根目录）还是後台页（tools/），路径都对。
     拿不到 currentScript（很旧的浏览器）才退回猜路径。 */
  var BASE = (function () {
    try {
      var me = doc && (doc.currentScript ||
        (function () {
          var ss = doc.getElementsByTagName("script");
          for (var i = ss.length - 1; i >= 0; i--) if (/voice\.js(\?|$)/.test(ss[i].src || "")) return ss[i];
          return null;
        })());
      if (me && me.src) return me.src.replace(/[^/]*$/, "") + "audio/";
      return /\/courses\/[^/]+\//.test(String(global.location.pathname))
        ? "../../shared/audio/" : "shared/audio/";
    } catch (e) { return "shared/audio/"; }
  })();

  /* ---------------------------------------------------------------------------
     速度设定
     学生端没有速度选项 —— 每个课程的预设速度由 shared/voice-config.js 决定，
     你在 tools/voice-admin.html 调好、发布，学生打开就是对的速度。

     config() 是唯一的读取入口。之後接 Supabase 时只要改这一个函式：
     从 Supabase 拉回设定、存进 TouchStore 当快取，其他地方都不用动。
  --------------------------------------------------------------------------- */
  function config() {
    var c = global.TouchVoiceConfig || {};
    return { rate: c.rate || {}, slowFactor: c.slowFactor == null ? 0.8 : c.slowFactor };
  }

  /* 从网址判断现在是哪一个课程：courses/<名字>/ */
  var COURSE = (function () {
    try {
      var m = /\/courses\/([^/]+)\//.exec(String(global.location.pathname));
      return m ? m[1] : "";
    } catch (e) { return ""; }
  })();

  function baseRate() {
    var r = config().rate;
    var v = (COURSE && r[COURSE] != null) ? r[COURSE] : r["default"];
    v = Number(v);
    /* 挡住设定档打错字（0 或负数会让音档整个不动、听起来像坏掉） */
    return (isFinite(v) && v >= 0.5 && v <= 1.5) ? v : 1;
  }
  function rateFor(slow) {
    var r = baseRate();
    return slow ? Math.max(0.5, r * config().slowFactor) : r;
  }

  /* ---------------------------------------------------------------------------
     档名：可读的部分 ＋ 一个短雜凑
     纯 slug 会撞名（"I am" 和 "I'm" 都变 i-am），纯雜凑则完全看不懂是哪一句。
     两个接起来：出事的时候看档名就知道是哪一条。
  --------------------------------------------------------------------------- */
  function slug(s) {
    return String(s).toLowerCase()
      .replace(/[‘’“”]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }
  function hash(s) {                       // djb2，Node 和浏览器算出来一样
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function key(text) {
    /* 「market .」和「market.」是同一句话，要算出同一个档名 ——
       课程里有些题型（排句、对话）的句子是一个词一格拼出来的，标点前会多一个空格。 */
    var t = String(text).replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim();
    return (slug(t) || "x") + "-" + hash(t);
  }

  /* manifest 列出有哪些音档。有它就能事先知道某一条有没有音档，
     不用先发一个会 404 的请求（404 会在 console 洗版，也会拖慢第一次播放）。
     manifest 载不到也不影响：那就改成「先试播、失败再退回」。 */
  var have = null;
  (function loadManifest() {
    try {
      var r = new XMLHttpRequest();
      r.open("GET", BASE + "manifest.json", true);
      r.onload = function () {
        if (r.status >= 200 && r.status < 300) {
          try {
            var m = JSON.parse(r.responseText);
            have = {};
            (m.keys || []).forEach(function (k) { have[k] = 1; });
          } catch (e) {}
        }
      };
      r.send();
    } catch (e) {}
  })();

  /* The other person in a dialogue speaks in a man's ("m") or a woman's ("f") voice, and
     that recording is the same key with "m-" / "f-" in front (tools/build-audio.mjs).
     opt.voice names it; when that file is missing the other one is tried, then Bella's —
     a line heard in review, away from its own lesson, still finds a human voice. */
  function fileKey(t, voice) {
    var k = key(t);
    if (!have || (voice !== "m" && voice !== "f")) return k;
    var other = voice === "m" ? "f" : "m";
    return have[voice + "-" + k] ? voice + "-" + k : have[other + "-" + k] ? other + "-" + k : k;
  }

  var MISSING = [];      // 退回机械音的字串（测试用）
  var cur = null;        // 正在播的 Audio
  var curBtn = null;

  function clearBtn() {
    if (curBtn) { curBtn.classList.remove("playing"); curBtn = null; }
  }

  function stop() {
    if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
    try { global.speechSynthesis && global.speechSynthesis.cancel(); } catch (e) {}
    clearBtn();
  }

  /* ---------------------------------------------------------------------------
     On iPhone the clips play through Web Audio, not <audio>.

     Marco's iPhone, 2026-09-25: the first 跟着说 is heard, every one after it comes
     back "aborted". The cause is a known iOS Safari fault: once an <audio> element has
     played AFTER speech recognition, WebKit leaves the phone's audio session in
     "playback" and the next recognition cannot get the microphone (the next sentence's
     model line autoplays, so the second try always follows an <audio>). Playing through
     an AudioContext does not move the session, so the microphone stays available.
     (technetexperts.com "iOS Safari Web Speech API bug"; lilting.ch iOS WebSpeech tips.)

     clip(url) behaves like the parts of an Audio element this file uses (playbackRate,
     onended, onerror, play() -> Promise, pause()). Slow speed: a buffer source has no
     preservesPitch, so the slow copy is time-stretched here (WSOLA) to keep the voice's
     pitch, as the <audio> path does. Anything that fails falls back to <audio>.
  --------------------------------------------------------------------------- */
  var IOS = /iP(hone|ad|od)/.test(global.navigator && global.navigator.userAgent || "") ||
    (/Macintosh/.test(global.navigator && global.navigator.userAgent || "") && (global.navigator.maxTouchPoints || 0) > 1);
  var AC = null;
  function actx() {
    if (!AC) {
      var C = global.AudioContext || global.webkitAudioContext;
      if (!C) return null;
      try { AC = new C(); } catch (e) { return null; }
    }
    if (AC.state === "suspended") { try { AC.resume(); } catch (e) {} }
    return AC;
  }
  /* Web Audio on iPhone obeys the silent switch, which <audio> did not: while a clip plays
     the page says it is "playback" (speaker, silent switch ignored), and hands the phone
     back to "auto" when it ends. Only between listens — shared/speech.js sets
     "play-and-record" before every recognition. */
  var playing = 0;
  function session(kind) {
    try { if (global.navigator && global.navigator.audioSession) global.navigator.audioSession.type = kind; } catch (e) {}
  }
  function started(s) {
    playing++; session("playback");
    var done = false;
    return function () { if (done) return; done = true; if (--playing <= 0) { playing = 0; session("auto"); } };
  }
  // an AudioContext may only start inside a tap: wake it on the first one
  if (IOS && doc) {
    var wake = function () { actx(); };
    doc.addEventListener("touchend", wake, { passive: true });
    doc.addEventListener("click", wake, true);
  }
  function decode(ab) {
    return new Promise(function (res, rej) {
      var p = AC.decodeAudioData(ab, res, rej);
      if (p && p.then) p.then(res, rej);
    });
  }
  var BUF = {};   // url -> Promise<AudioBuffer>
  function bufferFor(url) {
    if (!BUF[url]) BUF[url] = fetch(url).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.arrayBuffer();
    }).then(decode).catch(function (e) { delete BUF[url]; throw e; });
    return BUF[url];
  }
  /* Slower without dropping the pitch: waveform-similarity overlap-add. Frames of ~40 ms
     laid down every 10 ms of output, each taken from where the input has reached, nudged
     by up to ~3 ms to the spot that best continues the previous frame. */
  var SLOW = {};
  function stretch(buf, rate) {
    var sr = buf.sampleRate, N = Math.round(sr * 0.04) & ~1, Hs = N >> 2, tol = Math.round(sr * 0.003);
    var inLen = buf.length, outLen = Math.ceil(inLen / rate) + N;
    var out = AC.createBuffer(buf.numberOfChannels, outLen, sr);
    var win = new Float32Array(N);
    for (var i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
    var ref = buf.getChannelData(0), offs = [];
    var prev = 0, k, frames = Math.floor((outLen - N) / Hs);
    for (k = 0; k < frames; k++) {
      var nominal = Math.round(k * Hs * rate), best = nominal;
      if (k > 0) {
        var natural = prev + Hs, bestC = -Infinity;
        for (var d = -tol; d <= tol; d += 2) {
          var p = nominal + d;
          if (p < 0 || p + N > inLen) continue;
          var c = 0;
          for (var j = 0; j < N; j += 8) c += ref[natural + j] * ref[p + j] || 0;
          if (c > bestC) { bestC = c; best = p; }
        }
      }
      if (best + N > inLen) break;
      offs.push(best); prev = best;
    }
    for (var ch = 0; ch < buf.numberOfChannels; ch++) {
      var src = buf.getChannelData(ch), dst = out.getChannelData(ch), norm = new Float32Array(outLen);
      for (k = 0; k < offs.length; k++) {
        var o = k * Hs, s0 = offs[k];
        for (i = 0; i < N; i++) { dst[o + i] += src[s0 + i] * win[i]; norm[o + i] += win[i]; }
      }
      for (i = 0; i < outLen; i++) if (norm[i] > 1e-3) dst[i] /= norm[i];
    }
    return out;
  }
  function slowCopy(url, buf, rate) {
    var k = url + "@" + rate.toFixed(3);
    if (!SLOW[k]) SLOW[k] = stretch(buf, rate);
    return SLOW[k];
  }
  function clip(url) {
    if (!IOS || !actx() || !global.fetch) return new Audio(url);
    var c = { playbackRate: 1, onended: null, onerror: null, _src: null, _off: false };
    c.play = function () {
      return bufferFor(url).then(function (buf) {
        if (c._off) return;
        var r = Number(c.playbackRate) || 1;
        var b = Math.abs(r - 1) < 0.02 ? buf : slowCopy(url, buf, r);
        var s = AC.createBufferSource();
        s.buffer = b;
        s.connect(AC.destination);
        var end = started();
        s.onended = function () { end(); if (!c._off && c.onended) c.onended(); };
        c._src = s; c._end = end;
        if (AC.state === "suspended") AC.resume();
        s.start(0);
      }, function () { if (!c._off && c.onerror) c.onerror(); });
    };
    c.pause = function () { c._off = true; if (c._end) c._end(); if (c._src) { try { c._src.stop(); } catch (e) {} } };
    return c;
  }
  /* A learner's own recording (a Blob from MediaRecorder), through the same path. */
  function playBlob(blob, onErr) {
    stop();
    var fail = function (why) { if (onErr) onErr(why); };
    var viaTag = function () {
      try {
        var u = URL.createObjectURL(blob), a = new Audio(u);
        a.setAttribute("playsinline", "");
        a.onended = function () { try { URL.revokeObjectURL(u); } catch (e) {} };
        a.onerror = function () { fail("media-error " + ((a.error && a.error.code) || "") + " " + (blob.type || "")); };
        cur = a;
        var p = a.play();
        if (p && p.catch) p.catch(function (e) { fail((e && e.name) || "play-failed"); });
      } catch (e) { fail((e && e.message) || "error"); }
    };
    if (!IOS || !actx() || !blob.arrayBuffer) return viaTag();
    var c = { _off: false, _src: null, pause: function () { c._off = true; if (c._end) c._end(); if (c._src) { try { c._src.stop(); } catch (e) {} } } };
    cur = c;
    blob.arrayBuffer().then(decode).then(function (buf) {
      if (c._off) return;
      var s = AC.createBufferSource();
      s.buffer = buf; s.connect(AC.destination); c._src = s;
      var end = started(); c._end = end; s.onended = end;
      if (AC.state === "suspended") AC.resume();
      s.start(0);
    }, function (e) { fail("decode " + ((e && (e.name || e.message)) || "") + " " + (blob.type || "") + " " + blob.size + "B"); });
  }

  /* 退路：浏览器内建语音。
     长句子用机械音念很难听，所以 fallback 维持原本的规矩 —— 只念短的。
     （有 mp3 的时候不受这条限制，例句照样会念。） */
  function fallback(text, opt) {
    if (!("speechSynthesis" in global)) return false;
    var s = String(text).replace(/[.,!?"]/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return false;
    if (opt.fallbackMaxWords && s.split(" ").length > opt.fallbackMaxWords) return false;
    if (/[㐀-鿿぀-ヿ가-힯]/.test(s)) return false;   // 中日韩不念
    /* 哪些字退回了机械音 —— 测试时用 TouchVoice.missing 就看得到，
       方便回头把漏掉的音档补生成。 */
    MISSING.push(text);

    try {
      global.speechSynthesis.cancel();
      /* 缩写要展开，否则机械音会把 Mr. 念成一个字母一个字母 */
      var spoken = s.toLowerCase()
        .replace(/\bmr\b/g, "mister").replace(/\bmrs\b/g, "missus")
        .replace(/\bms\b/g, "miz").replace(/\bdr\b/g, "doctor");
      var u = new global.SpeechSynthesisUtterance(spoken);
      var vs = global.speechSynthesis.getVoices() || [];
      var v = vs.filter(function (x) { return /^en[-_]?(US|GB)/i.test(x.lang); })[0] ||
              vs.filter(function (x) { return /^en/i.test(x.lang); })[0];
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
      u.rate = (opt.rate != null ? opt.rate : rateFor(opt.slow)) * 0.85;   // 机械音本来就要再慢一点才听得懂
      if (opt.btn) { curBtn = opt.btn; curBtn.classList.add("playing"); }
      u.onend = u.onerror = function () { if (opt.btn) clearBtn(); if (opt.onDone) opt.onDone(); };
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  /* ---------------------------------------------------------------------------
     带学生名字的句子

     「My name is Marco.」每个学生不一样，没办法事先生成，以前整句退回机械音。
     现在：名字前後的部分各播真人音档，名字的位置空一拍 —— 名字不念，
     学生自己的名字他自己最会念（AI 连 Siti 都念成 City）。
     单独点到名字本身（排句题的词块）也不念，不要冒出一个机械音。

     课程设定 TouchVoice.names = ["Marco"]；课程原文里的 {NAME} 也认得。
     nameParts() 跟 tools/build-audio.mjs 的同名函式必须一模一样。
  --------------------------------------------------------------------------- */
  var NAMES = [];
  var NAME_GAP = 0.6;    // 名字那一拍空多久（秒）

  function nameParts(s, name) {
    var parts = String(s).split(name);
    return parts.map(function (p, i) {
      p = p.replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").replace(/^[\s.,!?;:]+/, "");
      if (i < parts.length - 1) p = p.replace(/[\s.,!?;:]+$/, "");
      return p.trim();
    }).filter(function (p) { return /[A-Za-z0-9]/.test(p); });
  }

  /* 这句有名字 → 回传要播的段落（可能是空阵列＝整句就是名字）；没有名字 → null */
  function withName(t) {
    var list = ["{NAME}"].concat(NAMES);
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (!n) continue;
      var re = new RegExp("(^|[^A-Za-z])" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-z])");
      if (!re.test(t)) continue;
      /* 先把名字换成 {NAME}，再照生成端同一套规则切 */
      var marked = t.split(re).length > 1 ? t.replace(new RegExp(re.source, "g"), "$1{NAME}") : t;
      return nameParts(marked, "{NAME}");
    }
    return null;
  }

  function playSegments(segs, opt) {
    if (!segs.length) return false;
    var token = {};
    cur = token;                                  // stop() 会把 cur 换掉，後面的段落就不再播
    if (opt.btn) { curBtn = opt.btn; curBtn.classList.add("playing"); }
    var i = 0;
    (function next() {
      if (cur !== token && !(cur && cur._seg === token)) return;
      if (i >= segs.length) { cur = null; clearBtn(); if (opt.onDone) opt.onDone(); return; }
      var seg = segs[i++];
      var sk = fileKey(seg, opt.voice);
      if (have && !have[sk]) { next(); return; }
      var a = clip(BASE + sk + ".mp3");
      a._seg = token;
      a.playbackRate = (opt.rate != null) ? opt.rate : rateFor(opt.slow);
      if ("preservesPitch" in a) a.preservesPitch = true;
      if ("webkitPreservesPitch" in a) a.webkitPreservesPitch = true;
      a.onended = function () { if (cur === a) setTimeout(next, NAME_GAP * 1000); };
      a.onerror = function () { if (cur === a) next(); };
      cur = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () { if (cur === a) { cur = null; clearBtn(); } });
    })();
    return "audio";
  }

  /* 主要入口。回传 "audio" / "tts" / false，方便测试与除错。 */
  function say(text, opt) {
    opt = opt || {};
    /* opt.onDone: called once when this line has finished (or could not play), so a
       caller can play lines one after another — the whole dialogue at once (Marco
       2026-09-25: 「完成全部的时候…一键播放来回对话」). Not called when stop() cut it. */
    if (opt.onDone) {
      var cb = opt.onDone, fired = false;
      opt.onDone = function () { if (!fired) { fired = true; try { cb(); } catch (e) {} } };
    }
    var r = say1(text, opt);
    if (r === false && opt.onDone) setTimeout(opt.onDone, 0);
    return r;
  }
  function say1(text, opt) {
    if (opt.fallbackMaxWords === undefined) opt.fallbackMaxWords = 3;
    var t = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
    if (!t) return false;
    /* 纯标点的词块（排句题里的「,」「.」）不发声 ——
       机械音会把它念成「comma」「period」，学生会以为那是一个单字。 */
    if (!/[A-Za-z0-9]/.test(t)) return false;
    /* 讲解型的选项（「live in = my home now; from = my origin」）不发声。
       那是给眼睛看的说明，不是一句英文，念出来学生会更乱。 */
    if (/[=;]/.test(t)) return false;

    stop();

    var k = fileKey(t, opt.voice);
    if (have && !have[k]) {
      var segs = withName(t);
      if (segs) return playSegments(segs, opt);
      return fallback(t, opt) ? "tts" : false;
    }

    try {
      var a = clip(BASE + k + ".mp3");
      a.playbackRate = (opt.rate != null) ? opt.rate : rateFor(opt.slow);
      if ("preservesPitch" in a) a.preservesPitch = true;          // 慢放不变音高
      if ("mozPreservesPitch" in a) a.mozPreservesPitch = true;
      if ("webkitPreservesPitch" in a) a.webkitPreservesPitch = true;

      if (opt.btn) { curBtn = opt.btn; curBtn.classList.add("playing"); }
      a.onended = function () { var mine = cur === a; if (mine) cur = null; clearBtn(); if (mine && opt.onDone) opt.onDone(); };
      /* 档案不在、或格式不支援 —— 静静退回浏览器语音，学生不会察觉 */
      a.onerror = function () {
        if (cur === a) cur = null;
        clearBtn();
        var segs = withName(t);                    // manifest 还没载到时才会走到这里
        var ok = segs ? playSegments(segs, opt) : fallback(t, opt);
        if (!ok && opt.onDone) opt.onDone();   // nothing could play: let a sequence move on
      };

      cur = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () {                       // 自动播放被挡等
        if (cur === a) cur = null;
        clearBtn();
        if (!fallback(t, opt) && opt.onDone) opt.onDone();
      });
      return "audio";
    } catch (e) {
      return fallback(t, opt) ? "tts" : false;
    }
  }

  /* ---------------------------------------------------------------------------
     长按 ＝ 慢速

     用事件委派挂在 document 上，课程那边不用改绑定：
     只要按钮是 .spk[data-w]（单字，课程本来就有）或 [data-say]（例句、对话），
     短按由课程自己的 onclick 处理，长按 400ms 就由这里接手，改播慢速。

     长按之後那一下 click 要挡掉，否则放开手指会再用正常速播一次。
  --------------------------------------------------------------------------- */
  var LONG = 400, lpTimer = null, lpFired = false;

  function lpTarget(node) {
    for (var el = node; el && el.nodeType === 1; el = el.parentElement) {
      if (el.matches && (el.matches("[data-say]") || el.matches(".spk[data-w]"))) return el;
    }
    return null;
  }
  function lpText(el) { return el.getAttribute("data-say") || el.getAttribute("data-w") || ""; }

  if (doc) {
    doc.addEventListener("pointerdown", function (e) {
      var el = lpTarget(e.target);
      if (!el) return;
      lpFired = false;
      clearTimeout(lpTimer);
      if (config().slowFactor >= 1) return;        // 后台把「长按慢速」关掉了
      lpTimer = setTimeout(function () {
        lpFired = true;
        say(lpText(el), { btn: el.classList.contains("spk") ? el : null, slow: true, voice: el.getAttribute("data-voice") || "" });
      }, LONG);
    }, { passive: true });

    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) {
      doc.addEventListener(t, function () { clearTimeout(lpTimer); }, { passive: true });
    });
    doc.addEventListener("pointermove", function (e) {
      if (lpTimer && (Math.abs(e.movementX || 0) > 8 || Math.abs(e.movementY || 0) > 8)) clearTimeout(lpTimer);
    }, { passive: true });

    /* 捕获阶段挡掉长按後的那一下 click */
    doc.addEventListener("click", function (e) {
      if (!lpFired) return;
      lpFired = false;
      e.stopPropagation(); e.preventDefault();
    }, true);

    /* 例句／对话这类没有自己 onclick 的元素，短按就由这里播 */
    doc.addEventListener("click", function (e) {
      var el = lpTarget(e.target);
      if (el && el.hasAttribute("data-say")) say(el.getAttribute("data-say"), { voice: el.getAttribute("data-voice") || "" });
    });
  }

  global.TouchVoice = {
    say: say,
    stop: stop,
    playBlob: playBlob,
    key: key,
    base: BASE,
    course: COURSE,
    rate: baseRate,          /* 这个课程现在用的速度 */
    rateFor: rateFor,
    /* 这一条有没有音档（manifest 还没载到时回传 null＝不知道） */
    has: function (t, voice) { return have ? !!have[fileKey(t, voice)] : null; },
    /* 学生自己的名字（课程在知道名字後设定）：这些字不念，句子在这里切开 */
    get names() { return NAMES.slice(); },
    set names(v) { NAMES = (v || []).map(function (x) { return String(x || "").trim(); }).filter(Boolean); },
    /* 这一页到目前为止，有哪些字没有音档、退回了机械音 */
    missing: function () { return MISSING.slice(); }
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
