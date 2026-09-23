/* =============================================================================
   TOUCH E-learning — 回到课程列表  (shared/nav.js)
   -----------------------------------------------------------------------------
   学生从启动页点进某个课程之後，本来没有路可以回到课程列表 ——
   只能按浏览器的上一页，或重开一次。

   每个课程在自己的「首页」最上面放一个「‹ 全部课程」。刻意不放在上课画面：
   上课中途离开会丢掉那一关的进度，那里各课程已经有自己的 ✕（会先问要不要退出）。

   -----------------------------------------------------------------------------
   用法（放在 storage.js / profile.js 之後）：

       <script src="../../shared/nav.js"></script>

       静态 HTML：放一个占位，载入时会自动填好
           <a data-te-courses></a>

       动态产生的画面（template string）：
           `${TouchNav.html()}<h1>…</h1>`

       React：
           {!TouchNav.embedded && <a className="te-courses" href={TouchNav.href}>{TouchNav.label()}</a>}

   -----------------------------------------------------------------------------
   被嵌在别的页面（iframe，例如公司的 learning portal）里时不显示 ——
   那时候该看到哪些课程由外层页面决定（例如 Level 1 学生只看得到 Level 1），
   在 iframe 里点进课程列表会把其他 level 的课程也露出来。

   跟 storage.js / profile.js 一样是传统 script，不是 ES module ——
   学生是双击 index.html 用 file:// 开的，file:// 底下 ES module 会被挡掉。
============================================================================= */

(function (global) {
  "use strict";

  /* 每个课程都在 courses/<名字>/index.html，启动页在根目录。
     在 TOUCH 平台里（storage.js 之前载入了 /api/learn/state.js）改回平台的 /learn ——
     那里只列这个学生这一级的课程，静态启动页会把全部课程都露出来。 */
  var PLATFORM = global.TOUCH_PLATFORM && typeof global.TOUCH_PLATFORM === "object" ? global.TOUCH_PLATFORM : null;
  var HREF = PLATFORM ? (PLATFORM.homeUrl || "/learn") : "../../index.html";

  var LABEL = PLATFORM ? {
    zh: "‹ 我的课程",
    ms: "‹ Kursus saya",
    en: "‹ My courses"
  } : {
    zh: "‹ 全部课程",
    ms: "‹ Semua kursus",
    en: "‹ All courses"
  };

  var embedded = (function () {
    try { return global.self !== global.top; } catch (e) { return true; }  // 跨网域读不到 top 本身就代表被嵌住
  })();

  /* 课程也会被单独部署（例如旧户口 touchenglish.github.io/TOUCH-Grammar/，
     那边没有启动页）。那种情况下 ../../index.html 是不存在的页面，
     所以只有在 courses/<课程>/ 底下才显示这个按钮。 */
  var inLauncher = (function () {
    try { return /\/courses\/[^/]+\//.test(String(global.location.pathname)); }
    catch (e) { return false; }
  })();

  var hidden = embedded || (!inLauncher && !PLATFORM);

  function label() {
    var P = global.TouchProfile;
    return P ? P.t(LABEL) : LABEL.en;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function html() {
    if (hidden) return "";
    return '<a class="te-courses" href="' + HREF + '">' + esc(label()) + "</a>";
  }

  /* 把静态 HTML 里的 <a data-te-courses> 填好（换语言时也会再叫一次） */
  function refresh() {
    if (!global.document) return;
    var els = global.document.querySelectorAll("[data-te-courses]");
    for (var i = 0; i < els.length; i++) {
      var a = els[i];
      if (hidden) { a.style.display = "none"; continue; }
      a.className = "te-courses";
      a.setAttribute("href", HREF);
      a.textContent = label();
    }
  }

  /* 样式跟着共用配色（theme.css 的 --te-*），fallback 一定要留 ——
     theme.css 没载到时按钮也还是正常的样子。 */
  function injectStyle() {
    if (!global.document || global.document.getElementById("te-courses-style")) return;
    var st = global.document.createElement("style");
    st.id = "te-courses-style";
    st.textContent =
      ".te-courses{display:inline-flex;align-items:center;gap:6px;" +
      "font-family:var(--te-font-display,'Fredoka','Nunito',system-ui,sans-serif);font-weight:600;" +
      "font-size:13.5px;line-height:1;color:var(--te-brand-2,#2E5685);text-decoration:none;" +
      "background:var(--te-brand-soft,#E6ECF4);border:1px solid var(--te-hairline,rgba(31,58,95,.08));" +
      "padding:8px 14px;border-radius:999px;margin:2px 0 14px;" +
      "-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
      ".te-courses:hover,.te-courses:focus-visible{background:var(--te-surface,#fff);" +
      "border-color:var(--te-brand-2,#2E5685);outline:none}";
    (global.document.head || global.document.documentElement).appendChild(st);
  }

  injectStyle();
  if (global.document && global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }
  if (global.TouchProfile) global.TouchProfile.onChange(refresh);

  global.TouchNav = {
    href: HREF,
    embedded: hidden,   // 对外就是「要不要显示」，两种情况都算
    label: label,
    html: html,
    refresh: refresh
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
