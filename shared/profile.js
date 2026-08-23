/* =============================================================================
   TOUCH E-learning — 共用「解释语言 ＋ 学生资料」  (shared/profile.js)
   -----------------------------------------------------------------------------
   学生第一次打开启动页时选一次语言、填一次资料，7 个课程都读得到。
   在这之前每个课程各自问一次 —— 同一个学生要选 4 次语言、填 4 次名字。

   -----------------------------------------------------------------------------
   两个观念要分清楚（这是 Pre-Beg／L1／L2 本来就定下的规矩，这里只是搬到共用层）：

     解释语言 ≠ 教材语言。
     英文教材永远是英文，不翻。换的只有「跟学生解释怎么做」的那些字。
     课程里写着：「英文学习内容相同，只有解释语言不同。」

   语言代码用 zh / ms / en 三个：

     zh   中文            所有解释以中文显示
     ms   Bahasa Melayu   Semua penerangan dalam Bahasa Melayu
     en   Simple English  All explanations in simple English

   为什么是 ms 不是 bm：Pre-Beg／L1／L2（三个最大的课程、资料里几百个
   {zh,ms,en} 物件）已经用 ms，改它们风险最大。grammar-full 用的是 bm，
   由它自己在边界换算 —— 见下面的 toBM／fromBM。
   显示给学生看的一律是「Bahasa Melayu」／「BM」，学生看不到代码。

   -----------------------------------------------------------------------------
   用法（放在 storage.js 之後、主 script 之前）：

       <script src="../../shared/storage.js"></script>
       <script src="../../shared/profile.js"></script>
       ...
       TouchProfile.lang()            // "zh" | "ms" | "en" | null（null = 还没选过）
       TouchProfile.setLang("zh")
       TouchProfile.t({zh:"继续", ms:"Teruskan", en:"Continue"})   // 依目前语言挑一个

       TouchProfile.get()             // { name, place, job, goal }（没填的是 ""）
       TouchProfile.set({ name:"Marco" })
       TouchProfile.filled()          // 填了几项
       TouchProfile.asked()           // 问过了没有（跳过也算问过）

       TouchProfile.onChange(fn)      // 语言或资料变动时叫我

   -----------------------------------------------------------------------------
   跟 storage.js／record.js 一样是「传统 script」不是 ES module ——
   学生是双击 index.html 用 file:// 开的，file:// 底下 ES module 会被 CORS 挡掉。
============================================================================= */

(function (global) {
  "use strict";

  var LANGS  = ["zh", "ms", "en"];
  var FIELDS = ["name", "place", "job", "goal"];

  /* 语言的自我介绍 —— 每一种都用它自己的语言写，学生才看得懂哪个是他要的 */
  var LANG_META = {
    zh: { flag: "中", name: "中文",           sub: "所有解释以中文显示" },
    ms: { flag: "My", name: "Bahasa Melayu",  sub: "Semua penerangan dalam Bahasa Melayu" },
    en: { flag: "En", name: "Simple English", sub: "All explanations in simple English" }
  };

  var store = global.TouchStore
    ? global.TouchStore.open("profile")
    : /* storage.js 没载到也不该让课程整个挂掉 —— 退成只存在记忆体 */
      (function () {
        var m = {};
        return { get: function (k, d) { return k in m ? m[k] : d; },
                 set: function (k, v) { m[k] = v; },
                 patch: function (o) { for (var k in o) m[k] = o[k]; },
                 all: function () { var c = {}; for (var k in m) c[k] = m[k]; return c; } };
      })();

  var listeners = [];
  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](); } catch (e) {}
    }
  }

  function lang() {
    var l = store.get("lang", null);
    return LANGS.indexOf(l) >= 0 ? l : null;
  }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0) return false;
    if (l === lang()) return true;
    store.set("lang", l);
    emit();
    return true;
  }

  /* 还没选过的时候要挑一个来显示 —— 用浏览器语言猜，猜不到就 en。
     注意：这不算「选过了」，语言闸还是会出现。 */
  function guess() {
    var n = (global.navigator && (global.navigator.language || global.navigator.userLanguage)) || "";
    n = String(n).toLowerCase();
    if (n.indexOf("zh") === 0) return "zh";
    if (n.indexOf("ms") === 0 || n.indexOf("id") === 0) return "ms";
    return "en";
  }

  function effective() { return lang() || guess(); }

  /* 依目前语言从 {zh,ms,en} 里挑一个。缺哪一种就退回 en，再退回第一个有值的。 */
  function t(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    var l = effective();
    if (obj[l]) return obj[l];
    if (obj.en) return obj.en;
    for (var i = 0; i < LANGS.length; i++) if (obj[LANGS[i]]) return obj[LANGS[i]];
    return "";
  }

  function get() {
    var p = {};
    for (var i = 0; i < FIELDS.length; i++) {
      p[FIELDS[i]] = String(store.get(FIELDS[i], "") || "").trim();
    }
    return p;
  }

  function set(patch) {
    if (!patch) return get();
    var out = {};
    for (var i = 0; i < FIELDS.length; i++) {
      var k = FIELDS[i];
      if (k in patch) out[k] = String(patch[k] == null ? "" : patch[k]).trim();
    }
    store.patch(out);
    emit();
    return get();
  }

  function filled() {
    var p = get(), n = 0;
    for (var i = 0; i < FIELDS.length; i++) if (p[FIELDS[i]]) n++;
    return n;
  }

  function asked()     { return !!store.get("asked", false); }
  function markAsked() { store.set("asked", true); emit(); }

  /* grammar-full 用 bm 不用 ms —— 只在那个课程的边界换算，别扩散出去 */
  function toBM(l)   { return l === "ms" ? "bm" : l; }
  function fromBM(l) { return l === "bm" ? "ms" : l; }

  global.TouchProfile = {
    LANGS: LANGS.slice(),
    FIELDS: FIELDS.slice(),
    meta: LANG_META,

    lang: lang,
    setLang: setLang,
    effective: effective,
    guess: guess,
    t: t,

    get: get,
    set: set,
    filled: filled,
    asked: asked,
    markAsked: markAsked,

    toBM: toBM,
    fromBM: fromBM,

    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    all: function () { return store.all(); }
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
