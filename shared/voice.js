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

  /* 退路：浏览器内建语音。
     长句子用机械音念很难听，所以 fallback 维持原本的规矩 —— 只念短的。
     （有 mp3 的时候不受这条限制，例句照样会念。） */
  function fallback(text, opt) {
    if (!("speechSynthesis" in global)) return false;
    var s = String(text).replace(/[.,!?"]/g, " ").replace(/\s+/g, " ").trim();
    if (!s) return false;
    if (opt.fallbackMaxWords && s.split(" ").length > opt.fallbackMaxWords) return false;
    if (/[㐀-鿿぀-ヿ가-힯]/.test(s)) return false;   // 中日韩不念
    try {
      global.speechSynthesis.cancel();
      var u = new global.SpeechSynthesisUtterance(s.toLowerCase());
      var vs = global.speechSynthesis.getVoices() || [];
      var v = vs.filter(function (x) { return /^en[-_]?(US|GB)/i.test(x.lang); })[0] ||
              vs.filter(function (x) { return /^en/i.test(x.lang); })[0];
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
      u.rate = (opt.rate != null ? opt.rate : rateFor(opt.slow)) * 0.85;   // 机械音本来就要再慢一点才听得懂
      if (opt.btn) {
        curBtn = opt.btn; curBtn.classList.add("playing");
        u.onend = u.onerror = clearBtn;
      }
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  /* 主要入口。回传 "audio" / "tts" / false，方便测试与除错。 */
  function say(text, opt) {
    opt = opt || {};
    if (opt.fallbackMaxWords === undefined) opt.fallbackMaxWords = 3;
    var t = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
    if (!t) return false;

    stop();

    var k = key(t);
    if (have && !have[k]) return fallback(t, opt) ? "tts" : false;

    try {
      var a = new Audio(BASE + k + ".mp3");
      a.playbackRate = (opt.rate != null) ? opt.rate : rateFor(opt.slow);
      if ("preservesPitch" in a) a.preservesPitch = true;          // 慢放不变音高
      if ("mozPreservesPitch" in a) a.mozPreservesPitch = true;
      if ("webkitPreservesPitch" in a) a.webkitPreservesPitch = true;

      if (opt.btn) { curBtn = opt.btn; curBtn.classList.add("playing"); }
      a.onended = function () { if (cur === a) cur = null; clearBtn(); };
      /* 档案不在、或格式不支援 —— 静静退回浏览器语音，学生不会察觉 */
      a.onerror = function () { if (cur === a) cur = null; clearBtn(); fallback(t, opt); };

      cur = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () {                       // 自动播放被挡等
        if (cur === a) cur = null;
        clearBtn(); fallback(t, opt);
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
        say(lpText(el), { btn: el.classList.contains("spk") ? el : null, slow: true });
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
      if (el && el.hasAttribute("data-say")) say(el.getAttribute("data-say"), {});
    });
  }

  global.TouchVoice = {
    say: say,
    stop: stop,
    key: key,
    base: BASE,
    course: COURSE,
    rate: baseRate,          /* 这个课程现在用的速度 */
    rateFor: rateFor,
    /* 这一条有没有音档（manifest 还没载到时回传 null＝不知道） */
    has: function (t) { return have ? !!have[key(t)] : null; }
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
