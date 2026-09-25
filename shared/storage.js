/* =============================================================================
   TOUCH E-learning — 共用存档层  (shared/storage.js)
   -----------------------------------------------------------------------------
   为什么有这个档案：

   原本 6 个课程各写各的 localStorage，用了 5 种命名法、26 个散落的 key
   （te_xp / te1_done / touch_ipa_state_v1 / touch_gp / touch-english-progress-v1 …），
   资料格式也各不相同。之后要接 Supabase 让学生进度存云端时，等於要改 6 个地方。

   现在全部课程共用这一个模组，每个课程在 localStorage 里只占「一个」key：

       touch:v1:<courseId>   ->   { 该课程的整包状态 }

   接 Supabase 的时候只要改这个档案，6 个课程都不用动。

   -----------------------------------------------------------------------------
   用法（课程 HTML 里）：

       <script src="../../shared/storage.js"></script>
       ...
       const store = TouchStore.open("pre-beginner");
       store.get("xp", 0);            // 读，第二个参数是预设值
       store.set("xp", 120);          // 写单一栏位（会立刻存档）
       store.patch({ xp: 120, lang: "zh" });   // 一次写多个栏位（只写一次 localStorage）
       store.all();                   // 拿整包状态
       store.clear();                 // 清掉这个课程的进度

   值是「原生 JSON 值」—— 物件、阵列、数字、布林都直接存直接读，
   不用自己 JSON.stringify / JSON.parse。

   -----------------------------------------------------------------------------
   设计上的两个限制（不要改掉）：

   1. 这是「传统 script」，不是 ES module。学生是双击 index.html 用 file:// 开的，
      而 file:// 底下 ES module 会被 CORS 挡掉，传统 script 才能正常载入。

   2. localStorage 不能用的时候（无痕模式、浏览器停用储存）会自动退回记忆体，
      课程照样能玩完，只是关掉分页就不保留。任何情况都不会丢出例外。

   -----------------------------------------------------------------------------
   放在 TOUCH 平台里（/elearning/…，要登入）的时候：

   课程页在 storage.js 之前先载入 <script src="/api/learn/state.js">，
   它会设好 window.TOUCH_PLATFORM = { student:{id,name,nickname,lang}, staff, blobs:{课程id:{…}} }。
   有这个物件，这里就自动：
     (a) localStorage 的 key 加上学生 id：touch:v1:<学生id>:<课程id>
         —— 同一支手机两个学生登入，进度不会混在一起
     (b) 用平台给的 blobs 盖掉本机的（平台为准）
     (c) 每次存档後 1.5 秒把整包送回 POST /api/learn/progress；
         关分页时用 sendBeacon 把还没送的送出去

   file:// 或 GitHub Pages 底下那个 script 载不到，TOUCH_PLATFORM 不存在，
   以上全部不会发生 —— 跟以前一模一样。课程本身不用改任何一行。
============================================================================= */

(function (global) {
  "use strict";

  var VERSION = "v1";

  /* 员工看「学生看到的样子」：?as=student（Marco 2026-09-25：「我不知道学生的画面到底长什么样，
     因为我现在是站在管理层看到的画面」）。员工开课程时平台不给 TOUCH_PLATFORM，课程就跑单机版
     （有自己的 Profile、问语言）—— 跟学生看到的不一样。这里假装成一个学生：画面完全照学生版，
     但进度只存这台装置（key 用 preview），不送平台、不算进任何学生。语言用 ?lang=zh|ms|en。 */
  if (!global.TOUCH_PLATFORM && global.location && /[?&]as=student\b/.test(global.location.search || "")) {
    var pl = ((global.location.search || "").match(/[?&]lang=(zh|ms|en)\b/) || [])[1] || "zh";
    global.TOUCH_PLATFORM = {
      student: { id: "preview", name: "Preview Student", nickname: "Alex", lang: pl },
      staff: true, preview: true, blobs: {}, homeUrl: "/ui-c/student-view"
    };
  }

  /* 平台给的资料（没有就是 null ＝ 单机模式） */
  var PLATFORM = (global.TOUCH_PLATFORM && typeof global.TOUCH_PLATFORM === "object") ? global.TOUCH_PLATFORM : null;
  var STUDENT  = PLATFORM && PLATFORM.student && PLATFORM.student.id != null ? String(PLATFORM.student.id) : "";
  var PREFIX = "touch:" + VERSION + ":" + (STUDENT ? STUDENT + ":" : "");

  /* localStorage 到底能不能用？无痕模式下 setItem 会直接丢例外。 */
  var persistent = (function () {
    try {
      var probe = "__touch_probe__";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return true;
    } catch (e) {
      return false;
    }
  })();

  /* localStorage 不可用时的退路；也当作已解析资料的快取。 */
  var memory = Object.create(null);

  function keyFor(courseId) {
    return PREFIX + courseId;
  }

  function readAll(courseId) {
    var k = keyFor(courseId);
    if (k in memory) return memory[k];

    var data = {};
    if (persistent) {
      try {
        var raw = localStorage.getItem(k);
        if (raw) {
          var parsed = JSON.parse(raw);
          /* 只接受物件；阵列或纯量代表资料坏了，当成空的重来。 */
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) data = parsed;
        }
      } catch (e) {
        /* 内容毁损或被挡 → 当成空的，不要让课程整个挂掉 */
      }
    }
    memory[k] = data;
    return data;
  }

  function writeAll(courseId, data) {
    var k = keyFor(courseId);
    memory[k] = data;
    if (persistent) {
      try {
        localStorage.setItem(k, JSON.stringify(data));
      } catch (e) {
        /* 配额满或被挡 → 这个 session still 有 memory 那份 */
      }
    }
    emit(courseId, data);
  }

  /* ---------- 存档变动通知（平台同步就是挂在这里） ---------- */
  var listeners = [];
  function emit(courseId, data) {
    if (!listeners.length) return;
    var copy;
    try { copy = JSON.parse(JSON.stringify(data)); } catch (e) { copy = {}; }
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](courseId, copy); } catch (e) {}
    }
  }
  function onChange(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* 用外来的资料（平台）整包盖掉本机的。不触发 onChange —— 这不是学生做的变动，
     不用再送回平台。 */
  function hydrate(blobs) {
    if (!blobs || typeof blobs !== "object") return 0;
    var n = 0;
    for (var id in blobs) {
      if (!Object.prototype.hasOwnProperty.call(blobs, id)) continue;
      var b = blobs[id];
      if (!b || typeof b !== "object" || Array.isArray(b)) continue;
      var k = keyFor(id);
      memory[k] = b;
      if (persistent) { try { localStorage.setItem(k, JSON.stringify(b)); } catch (e) {} }
      n++;
    }
    return n;
  }

  function open(courseId) {
    if (!courseId || typeof courseId !== "string") {
      throw new Error("TouchStore.open() 需要一个课程 id，例如 TouchStore.open('level-1')");
    }

    return {
      courseId: courseId,
      persistent: persistent,

      /* 读一个栏位；没有的话回传 fallback（预设 null）。 */
      get: function (field, fallback) {
        var data = readAll(courseId);
        return Object.prototype.hasOwnProperty.call(data, field)
          ? data[field]
          : (fallback === undefined ? null : fallback);
      },

      /* 写一个栏位并立刻存档。 */
      set: function (field, value) {
        var data = readAll(courseId);
        data[field] = value;
        writeAll(courseId, data);
        return value;
      },

      /* 一次写多个栏位，只碰一次 localStorage —— 存整包状态时用这个。 */
      patch: function (fields) {
        if (!fields || typeof fields !== "object") return;
        var data = readAll(courseId);
        for (var f in fields) {
          if (Object.prototype.hasOwnProperty.call(fields, f)) data[f] = fields[f];
        }
        writeAll(courseId, data);
      },

      /* 拿整包状态的复本（改它不会影响存档）。 */
      all: function () {
        var data = readAll(courseId);
        try {
          return JSON.parse(JSON.stringify(data));
        } catch (e) {
          return {};
        }
      },

      /* 整包覆写。 */
      replaceAll: function (data) {
        writeAll(courseId, data && typeof data === "object" ? data : {});
      },

      remove: function (field) {
        var data = readAll(courseId);
        delete data[field];
        writeAll(courseId, data);
      },

      /* 清掉这个课程的全部进度。 */
      clear: function () {
        var k = keyFor(courseId);
        delete memory[k];
        if (persistent) {
          try { localStorage.removeItem(k); } catch (e) {}
        }
        emit(courseId, {});
      }
    };
  }

  /* 列出目前有存档的课程 id。 */
  function courses() {
    var found = {};
    if (persistent) {
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          /* 单机模式的前缀 touch:v1: 也会比对到 touch:v1:<学生id>:… —— 有冒号的不是课程 id */
          if (k && k.indexOf(PREFIX) === 0 && k.slice(PREFIX.length).indexOf(":") < 0) found[k.slice(PREFIX.length)] = true;
        }
      } catch (e) {}
    }
    for (var mk in memory) found[mk.slice(PREFIX.length)] = true;
    return Object.keys(found).sort();
  }

  /* 一次拿出所有课程的状态。
     接 Supabase 之后，这就是要往云端推的那包东西。 */
  function exportAll() {
    var out = {};
    courses().forEach(function (id) {
      out[id] = open(id).all();
    });
    return out;
  }

  /* ---------- 平台同步 ----------
     每次存档都整包送（blob 都很小，几 KB），同一个课程 1.5 秒内的连续存档合并成一次。
     送失败（没网路、伺服器出错）就留着，10 秒後再试；
     401／403 代表登入过期，不重试 —— 平台会在下次载入时要他重新登入。 */
  var ENDPOINT = (PLATFORM && PLATFORM.progressUrl) || "/api/learn/progress";
  var pending = {}, timer = null;

  function schedule(ms) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { flush(false); }, ms);
  }

  function flush(leaving) {
    if (timer) { clearTimeout(timer); timer = null; }
    var ids = Object.keys(pending);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i], state = pending[id];
      delete pending[id];
      var body = JSON.stringify({ courseId: id, state: state });
      if (leaving && global.navigator && navigator.sendBeacon) {
        try { if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }))) continue; } catch (e) {}
      }
      send(id, state, body);
    }
  }

  function send(id, state, body) {
    var retry = function () {
      if (!(id in pending)) pending[id] = state;   // 这段时间又存过的话，送新的那份就好
      schedule(10000);
    };
    try {
      fetch(ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: body, credentials: "same-origin", keepalive: true
      }).then(function (r) {
        if (!r.ok && r.status !== 401 && r.status !== 403 && r.status !== 400) retry();
      }, retry);
    } catch (e) { retry(); }
  }

  if (PLATFORM && !PLATFORM.preview) {
    /* 平台为准：先用平台的资料盖掉本机 */
    var fromPlatform = PLATFORM.blobs && typeof PLATFORM.blobs === "object" ? PLATFORM.blobs : {};
    hydrate(fromPlatform);
    /* 本机有、平台没有的（例如上次关分页时没送成功），补送一次 */
    courses().forEach(function (id) {
      if (!Object.prototype.hasOwnProperty.call(fromPlatform, id)) pending[id] = readAll(id);
    });
    if (Object.keys(pending).length) schedule(1500);

    onChange(function (id, data) { pending[id] = data; schedule(1500); });
    if (global.addEventListener) {
      global.addEventListener("pagehide", function () { flush(true); });
      global.addEventListener("visibilitychange", function () {
        if (global.document && document.visibilityState === "hidden") flush(true);
      });
    }
  }

  global.TouchStore = {
    version: VERSION,
    prefix: PREFIX,
    persistent: persistent,
    open: open,
    courses: courses,
    exportAll: exportAll,
    hydrate: hydrate,
    onChange: onChange,
    flush: function () { flush(false); },
    /* 平台给的学生资料；单机模式是 null */
    platform: PLATFORM,
    student: PLATFORM && PLATFORM.student ? PLATFORM.student : null,
    staff: !!(PLATFORM && PLATFORM.staff)
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
