/* =============================================================================
   TOUCH E-learning — 共用录音模组  (shared/record.js)
   -----------------------------------------------------------------------------
   学生「跟着说、录下来、听回放」用的。原本只写在 courses/level-1 里，
   现在抽出来给全部课程共用。

   -----------------------------------------------------------------------------
   为什么不是直接 MediaRecorder.start() 就好 —— 三个时间缓冲的用意：

   CD_TICK  (650ms)  3・2・1 倒数的节奏。倒数期间麦克风「已经开着但还没开始录」，
                     学生这时不能说话。

   HEAD_BUF (400ms)  倒数结束後，录音器先偷跑 400ms 才显示「🟢 Speak now」。
                     不这样做的话，学生一看到提示就开口，第一个音节会被切掉
                     —— 因为 MediaRecorder 从 start() 到真的开始收音有延迟。

   TAIL_BUF (450ms)  学生按下停止後，再多录 450ms 才真的停。
                     不这样做的话最後一个字的尾音会被切掉。

   这三个数字是 level-1 实际调出来的，不要随便改。

   -----------------------------------------------------------------------------
   用法（课程 HTML 里，放在主 script 之前）：

       <script src="../../shared/record.js"></script>
       ...
       const rec = TouchRecord.open("speaking-bonus");   // 每个课程一个命名空间

       if (!rec.available) { ...这台浏览器不能录音，隐藏录音区... }

       const session = rec.capture({
         onCountdown : n    => status.textContent = "准备… " + n,
         onSpeakNow  : ()   => status.textContent = "🟢 现在说",
         onSaving    : ()   => status.textContent = "储存中…",
         onDone      : blob => { playBtn.disabled = false; },
         onDenied    : ()   => status.textContent = "没有麦克风权限",
         saveAs      : "day1-p2"        // 有给的话会自动存进 IndexedDB
       });
       stopBtn.onclick = () => session.stop();

       await rec.load("day1-p2");   // 下次进来把上次录的载回来
       rec.play(blob);

   -----------------------------------------------------------------------------
   两个刻意的设计限制（不要改掉）：

   1. 这是「传统 script」，不是 ES module。学生是双击 index.html 用 file:// 开的，
      file:// 底下 ES module 会被 CORS 挡掉。跟 shared/storage.js 一样。

   2. 录音只存在学生自己的电脑（IndexedDB），不会上传到任何地方。
      换电脑或清除浏览器资料就会不见 —— 这是目前的设计，不是 bug。
============================================================================= */

(function (global) {
  "use strict";

  var CD_TICK  = 650;   // 倒数每一格的毫秒数
  var HEAD_BUF = 400;   // 「Speak now」之前先偷跑的毫秒数（保住第一个音节）
  var TAIL_BUF = 450;   // 按下停止之後继续录的毫秒数（保住最後一个字）

  var available = !!(
    global.MediaRecorder &&
    global.navigator && global.navigator.mediaDevices &&
    global.navigator.mediaDevices.getUserMedia &&
    global.indexedDB
  );

  function open(namespace) {
    if (!namespace || typeof namespace !== "string") {
      throw new Error("TouchRecord.open() 需要一个命名空间，例如 TouchRecord.open('speaking-bonus')");
    }

    var DB_NAME = "touch-rec-" + namespace;
    var STORE   = "recs";

    /* 同一时间只会有一段录音在进行；换页或重录时要把上一段彻底收乾净，
       否则麦克风会一直亮着、计时器也会继续跑。 */
    var live = { recorder: null, stream: null, audio: null, timers: [] };

    function later(fn, ms) {
      var id = setTimeout(fn, ms);
      live.timers.push(id);
      return id;
    }

    function stopAll() {
      live.timers.forEach(clearTimeout);
      try { if (live.recorder && live.recorder.state === "recording") live.recorder.stop(); } catch (e) {}
      try { if (live.stream) live.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      try { if (live.audio) live.audio.pause(); } catch (e) {}
      live = { recorder: null, stream: null, audio: null, timers: [] };
    }

    /* ---------- IndexedDB：录音档存在这里 ---------- */

    function db() {
      return new Promise(function (res, rej) {
        var r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
        r.onsuccess = function () { res(r.result); };
        r.onerror   = function () { rej(r.error); };
      });
    }

    function save(key, blob) {
      return db().then(function (d) {
        return new Promise(function (res, rej) {
          var tx = d.transaction(STORE, "readwrite");
          tx.objectStore(STORE).put(blob, key);
          tx.oncomplete = function () { res(true); };
          tx.onerror    = function () { rej(tx.error); };
        });
      }).catch(function () { return false; });   // 存不进去不该让课程挂掉
    }

    function load(key) {
      return db().then(function (d) {
        return new Promise(function (res, rej) {
          var q = d.transaction(STORE).objectStore(STORE).get(key);
          q.onsuccess = function () { res(q.result || null); };
          q.onerror   = function () { rej(q.error); };
        });
      }).catch(function () { return null; });
    }

    function remove(key) {
      return db().then(function (d) {
        return new Promise(function (res) {
          var tx = d.transaction(STORE, "readwrite");
          tx.objectStore(STORE).delete(key);
          tx.oncomplete = function () { res(true); };
          tx.onerror    = function () { res(false); };
        });
      }).catch(function () { return false; });
    }

    /* ---------- 播放 ---------- */

    function play(blob) {
      if (!blob) return null;
      try {
        var url = URL.createObjectURL(blob);
        live.audio = new Audio(url);
        live.audio.onended = function () { try { URL.revokeObjectURL(url); } catch (e) {} };
        var p = live.audio.play();
        if (p && p.catch) p.catch(function () {});   // 浏览器挡自动播放时不要丢例外
        return live.audio;
      } catch (e) { return null; }
    }

    /* ---------- 录音：倒数 → 偷跑 → 说 → 收尾 ---------- */

    function capture(opts) {
      opts = opts || {};
      var noop = function () {};
      var onCountdown = opts.onCountdown || noop;
      var onSpeakNow  = opts.onSpeakNow  || noop;
      var onSaving    = opts.onSaving    || noop;
      var onDone      = opts.onDone      || noop;
      var onDenied    = opts.onDenied    || noop;

      var phase  = "prep";     // prep → count → buffer → speaking → saving → done
      var chunks = [];
      var cancelled = false;

      if (!available) { onDenied(new Error("此浏览器不支援录音")); return controller(); }

      stopAll();   // 收乾净上一段

      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        if (cancelled) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
        live.stream = stream;

        var n = 3;
        phase = "count";
        onCountdown(n);

        var tick = function () {
          if (cancelled) return;
          n--;
          if (n > 0) { onCountdown(n); later(tick, CD_TICK); return; }

          /* 倒数结束 —— 录音器先偷跑，HEAD_BUF 之後才叫学生开口 */
          try {
            live.recorder = new MediaRecorder(live.stream);
            live.recorder.ondataavailable = function (e) { if (e.data) chunks.push(e.data); };
            live.recorder.onstop = function () {
              var blob = new Blob(chunks, { type: (live.recorder && live.recorder.mimeType) || "audio/webm" });
              try { live.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
              phase = "done";
              if (opts.saveAs) { save(opts.saveAs, blob).then(function () { onDone(blob); }); }
              else onDone(blob);
            };
            live.recorder.start();
          } catch (e) { onDenied(e); return; }

          phase = "buffer";
          later(function () {
            if (cancelled) return;
            phase = "speaking";
            onSpeakNow();
          }, HEAD_BUF);
        };

        later(tick, CD_TICK);
      }).catch(function (err) {
        phase = "done";
        onDenied(err);                      // 使用者拒绝麦克风、或没有麦克风
      });

      function controller() {
        return {
          /* 学生按下停止 —— 不马上停，多录 TAIL_BUF 保住尾音 */
          stop: function () {
            if (phase !== "speaking") return false;
            phase = "saving";
            onSaving();
            later(function () {
              try {
                if (live.recorder && live.recorder.state === "recording") live.recorder.stop();
              } catch (e) { onDenied(e); }
            }, TAIL_BUF);
            return true;
          },
          cancel: function () { cancelled = true; stopAll(); },
          get phase() { return phase; }
        };
      }
      return controller();
    }

    return {
      namespace: namespace,
      available: available,
      save: save,
      load: load,
      remove: remove,
      play: play,
      stopAll: stopAll,
      capture: capture
    };
  }

  global.TouchRecord = {
    available: available,
    open: open,
    timings: { CD_TICK: CD_TICK, HEAD_BUF: HEAD_BUF, TAIL_BUF: TAIL_BUF }
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
