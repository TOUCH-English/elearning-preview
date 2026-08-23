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
============================================================================= */

(function (global) {
  "use strict";

  var VERSION = "v1";
  var PREFIX = "touch:" + VERSION + ":";

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
          if (k && k.indexOf(PREFIX) === 0) found[k.slice(PREFIX.length)] = true;
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

  global.TouchStore = {
    version: VERSION,
    prefix: PREFIX,
    persistent: persistent,
    open: open,
    courses: courses,
    exportAll: exportAll
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
