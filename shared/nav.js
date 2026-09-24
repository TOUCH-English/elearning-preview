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

  /* ===========================================================================
     在平台里：七个课程共用同一条「课程栏」（Marco 2026-09-24 QA：「进到不同的 level，
     好像又进到不同平台」—— 七个课程顶上是五种不同的顶栏）。
     · 左：玻璃圆「‹」回我的课程　中：课程名　右：解释语言（iPhone 原生的选择器）
     · 只在课程「首页」出现：看画面上有没有 .te-courses（各课程只在首页放它）。
       进到上课画面就收起来，交给课程自己的 ✕ 和进度 —— 上课中途按返回会丢掉那一关。
     · 各课程自己的顶栏、XP 胶囊、语言切换、回课程按钮在平台里一律不显示（下面的 CSS）。
     · 换语言：写进共用 profile，同时送到平台（POST /api/learn/language，学生自己改，
       Marco 2026-09-24 选 A），然後重新载入 —— 七个课程都从同一个地方读语言。
     平台以外（员工、测试站、file://）这些都不会出现，课程照原本的样子。
     =========================================================================== */
  var COURSE_NAME = {
    "pre-beginner": "Pre-Beginner", "level-1": "Level 1", "level-2": "Level 2",
    "speaking-bonus": "Speaking Bonus", "ipa": "IPA Pronunciation",
    "grammar": "Grammar Course", "grammar-full": "Grammar Path"
  };   /* 跟平台 lib/preview/courses.ts 的名字一样 */
  var LANG_SHORT = { zh: "中", ms: "BM", en: "EN" };
  var LANG_NAME  = { zh: "中文", ms: "Bahasa Melayu", en: "English" };
  var BACK_LABEL = { zh: "我的课程", ms: "Kursus saya", en: "My courses" };

  function courseId() {
    try { var m = /\/courses\/([^/]+)\//.exec(String(global.location.pathname)); return m ? m[1] : ""; }
    catch (e) { return ""; }
  }

  function injectBarStyle() {
    var d = global.document;
    if (!d || d.getElementById("te-cbar-style")) return;
    var st = d.createElement("style");
    st.id = "te-cbar-style";
    st.textContent = [
      /* 课程自己的顶栏：Pre-Beginner／Level 1／Level 2、Speaking Bonus、IPA、Grammar Course、Grammar Path */
      "html.te-platform #topbar, html.te-platform .top:has(> img.logo), html.te-platform #hud,",
      /* ⚠️ Grammar Path 的顶栏是 .phone > .phead；Pre-Beginner 等上课画面的 ✕＋进度那一行也叫 .phead，不能一起藏 */
      "html.te-platform .te-top, html.te-platform .phone > .phead { display:none !important }",
      /* 课程栏已经写了课程名：IPA、Grammar Course 首页自己的大标题就重复了（其他课程本来就没有） */
      "html.te-platform .hero:has(> span.logo) > span.logo, html.te-platform .hero:has(> span.logo) > h1,",
      "html.te-platform .hero:has(> span.logo) > p, html.te-platform .te-home > .te-eyebrow,",
      "html.te-platform .te-home > .te-h1, html.te-platform .te-home > .te-sub { display:none !important }",
      /* 回课程的链接留在 DOM 里当「这是首页」的记号，但不显示 */
      "html.te-platform .te-courses { display:block !important; height:0 !important; margin:0 !important; padding:0 !important;",
      "  border:0 !important; overflow:hidden !important; visibility:hidden !important }",
      /* Grammar Path 原本整个装在一张「手机」卡片里 —— 在手机上就是手机里又一支手机 */
      "html.te-platform .stage { padding:0 !important }",
      "html.te-platform .phone { max-width:none !important; min-height:100vh !important; border:0 !important; border-radius:0 !important;",
      "  box-shadow:none !important; background:transparent !important; overflow:visible !important }",
      /* IPA 的底部导航：平台同一颗浮起来的玻璃胶囊，只有图标，所在页是实心圆 */
      "html.te-platform #nav { position:fixed !important; left:12px; right:12px; bottom:calc(env(safe-area-inset-bottom) + 8px);",
      "  max-width:446px; margin:0 auto; justify-content:center; gap:28px; padding:8px !important; border-radius:999px;",
      "  background-color:rgba(255,255,255,.62); -webkit-backdrop-filter:blur(20px) saturate(1.5); backdrop-filter:blur(20px) saturate(1.5);",
      "  border:1px solid rgba(255,255,255,.75); background-image:linear-gradient(to bottom,rgba(255,255,255,.65) 0,transparent 55%);",
      "  box-shadow:0 16px 48px rgba(14,36,86,.16) }",
      "html.te-platform #nav button { flex:none !important; width:40px; height:40px; border-radius:50%; padding:0 !important; justify-content:center }",
      "html.te-platform #nav button .lbl { display:none }",
      "html.te-platform #nav button .i { background:none !important; width:auto; height:auto }",
      "html.te-platform #nav button.on { background-color:rgba(255,255,255,.72); box-shadow:0 1px 2px rgb(20 33 50/.10),0 6px 16px -6px rgb(20 33 50/.24),inset 0 1px 0 rgb(255 255 255/.95),inset 0 -7px 14px -9px rgb(31 90 180/.30) }",
      /* 课程栏本身：平台的玻璃（.ui-glass 的数值），iOS 导航列的高度 */
      ".te-cbar { position:fixed; z-index:90; left:0; right:0; top:0; padding:calc(env(safe-area-inset-top) + 8px) 12px 8px;",
      "  background-color:rgba(238,242,251,.72); -webkit-backdrop-filter:blur(20px) saturate(1.5); backdrop-filter:blur(20px) saturate(1.5);",
      "  border-bottom:1px solid rgba(255,255,255,.75); display:none }",
      "html.te-cbar-on .te-cbar { display:block }",
      "html.te-cbar-on body { padding-top:calc(env(safe-area-inset-top) + 60px) !important }",
      /* 上课画面没有课程栏：从主画面的 App 打开时，内容仍要让开时间和电量那一条 */
      "html.te-platform:not(.te-cbar-on) body { padding-top:env(safe-area-inset-top) !important }",
      /* 上课画面的 ✕（Pre-Beginner／Level 1／Level 2）：跟课程栏同一颗玻璃圆 */
      "html.te-platform .pquit { flex:none; width:40px; height:40px; padding:0 !important; border-radius:50%; display:grid; place-items:center;",
      "  font-size:17px !important; color:var(--te-ink,#16202E) !important; background-color:rgba(255,255,255,.72) !important;",
      "  box-shadow:0 1px 2px rgb(20 33 50/.10),0 6px 16px -6px rgb(20 33 50/.24),inset 0 1px 0 rgb(255 255 255/.95) }",
      ".te-cbar-in { max-width:470px; margin:0 auto; display:flex; align-items:center; gap:10px; height:44px }",
      ".te-cbtn { position:relative; flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center;",
      "  color:var(--te-brand,#15357B); text-decoration:none; font:600 13px var(--te-font-body,'Plus Jakarta Sans',system-ui,sans-serif);",
      "  background-color:rgba(255,255,255,.72); -webkit-backdrop-filter:blur(16px) saturate(1.6); backdrop-filter:blur(16px) saturate(1.6);",
      "  box-shadow:0 1px 2px rgb(20 33 50/.10),0 6px 16px -6px rgb(20 33 50/.24),inset 0 1px 0 rgb(255 255 255/.95);",
      "  -webkit-tap-highlight-color:transparent; transition:transform 120ms cubic-bezier(.2,.8,.2,1) }",
      ".te-cbtn:active { transform:scale(.92) }",
      ".te-cbtn svg { width:20px; height:20px }",
      ".te-cbtn select { position:absolute; inset:0; opacity:0; width:100%; height:100%; font-size:16px; cursor:pointer }",
      ".te-ctitle { flex:1; min-width:0; text-align:center; font:600 16px/1.2 var(--te-font-display,'Sora',system-ui,sans-serif);",
      "  letter-spacing:-.01em; color:var(--te-ink,#16202E); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }"
    ].join("\n");
    (d.head || d.documentElement).appendChild(st);
  }

  function curLang() {
    var P = global.TouchProfile;
    var l = P && (P.lang() || P.effective());
    return LANG_SHORT[l] ? l : "en";
  }

  function buildBar() {
    var d = global.document;
    if (!d || !d.body || d.getElementById("te-cbar")) return;
    var l = curLang();
    var bar = d.createElement("div");
    bar.id = "te-cbar";
    bar.className = "te-cbar";
    var opts = "";
    for (var k in LANG_NAME) opts += '<option value="' + k + '"' + (k === l ? " selected" : "") + ">" + LANG_NAME[k] + "</option>";
    bar.innerHTML =
      '<div class="te-cbar-in">' +
        '<a class="te-cbtn" href="' + HREF + '" aria-label="' + esc(BACK_LABEL[l]) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></a>' +
        '<div class="te-ctitle">' + esc(COURSE_NAME[courseId()] || "") + "</div>" +
        '<label class="te-cbtn" aria-label="Language"><span>' + LANG_SHORT[l] + "</span>" +
          '<select id="te-clang">' + opts + "</select></label>" +
      "</div>";
    d.body.insertBefore(bar, d.body.firstChild);
    d.getElementById("te-clang").addEventListener("change", function (e) {
      var v = e.target.value, P = global.TouchProfile, S = global.TouchStore;
      if (P) P.setLang(v);
      var done = function () {
        try { if (S && S.flush) S.flush(); } catch (err) {}
        global.location.reload();
      };
      try {
        global.fetch("/api/learn/language", {
          method: "POST", credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: v })
        }).then(done, done);
      } catch (err) { done(); }
    });
  }

  /* 画面上有没有看得见的首页记号（.te-courses） */
  function onHome() {
    var els = global.document.querySelectorAll(".te-courses, [data-te-courses]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], vis = true;
      for (var n = el.parentElement; n && n !== global.document.body; n = n.parentElement) {
        var cs = global.getComputedStyle(n);
        if (cs.display === "none") { vis = false; break; }
      }
      if (vis) return true;
    }
    return false;
  }

  function startBar() {
    if (!PLATFORM || embedded || !global.document) return;
    injectBarStyle();
    var go = function () {
      buildBar();
      var pending = false;
      var check = function () {
        pending = false;
        global.document.documentElement.classList.toggle("te-cbar-on", onHome());
      };
      check();
      new global.MutationObserver(function () {
        if (!pending) { pending = true; global.requestAnimationFrame(check); }
      }).observe(global.document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    };
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", go);
    else go();
  }

  injectStyle();
  startBar();
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
