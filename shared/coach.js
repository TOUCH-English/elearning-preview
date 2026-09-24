/* =============================================================================
   TouchCoach — the teacher character, in poses
   -----------------------------------------------------------------------------
   Marco 2026-09-24: like Duolingo, the character should react to what is on the
   screen — 「在不同的题目上就放适当的人跟适当的姿势」. He generated Amy's seven
   poses in ChatGPT (idle, wave, talk, point, celebrate, think, listen).

   Why poses and not animation frames: AI images of "the same" character drift a
   little in face and proportion from one picture to the next, so flicking
   between near-identical frames shimmers. Instead each pose is one picture, the
   movement is done here in code (a slow breath while standing, a small pop when
   the pose changes, a hop when she celebrates), and changing pose IS the
   animation — thinking while you answer, celebrating when you're right.

   The seven pictures were aligned before they came in: the source layout.json
   (scale + offset per pose) was baked into the files, all seven cropped to the
   same box, so the feet sit on the same line and any pose can replace any other
   in the same spot. Files: shared/assets/characters/<who>/<who>-<pose>.webp,
   702:1300 (width:height), feet 13px above the bottom at full size.

   "point" points to the viewer's LEFT; mirror:true makes it point right.

   Plain script, no dependencies. Styles are injected once.

     var c = TouchCoach.mount(el, { pose: "idle", height: 120 });
     c.pose("celebrate");            // swap, with a hop
     c.pose("point", { mirror: true });
     TouchCoach.src("amy", "wave")   // a picture's address, for plain <img>s
============================================================================= */
(function () {
  "use strict";
  if (window.TouchCoach) return;

  var POSES = ["idle", "wave", "talk", "point", "celebrate", "think", "listen"];
  var RATIO = 702 / 1300;

  // where shared/ is: taken from this script's own address, so it works from any course
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (s && /\/shared\/coach\.js/.test(s)) return s.replace(/coach\.js.*$/, "");
    return "../../shared/";
  })();

  var CSS = [
    ".tc{display:inline-block;position:relative;flex:none;line-height:0;vertical-align:bottom}",
    ".tc-move{display:block;transform-origin:50% 100%;animation:tc-breathe 3.4s ease-in-out infinite}",
    ".tc-flip{display:block}",
    ".tc-flip.m{transform:scaleX(-1)}",
    ".tc img{display:block;width:100%;height:100%;object-fit:contain;object-position:50% 100%;pointer-events:none;user-select:none;-webkit-user-drag:none}",
    ".tc.pop .tc-move{animation:tc-pop .38s cubic-bezier(.3,1.5,.5,1) both}",
    ".tc.hop .tc-move{animation:tc-hop .6s cubic-bezier(.3,1.4,.5,1) both}",
    "@keyframes tc-breathe{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-1.5px) scale(1.012,.99)}}",
    "@keyframes tc-pop{0%{transform:scale(.94)}60%{transform:scale(1.03)}100%{transform:scale(1)}}",
    "@keyframes tc-hop{0%{transform:translateY(0) scale(1,1)}25%{transform:translateY(0) scale(1.04,.94)}55%{transform:translateY(-12%) scale(.98,1.03)}80%{transform:translateY(0) scale(1.03,.97)}100%{transform:translateY(0) scale(1,1)}}",
    "@media (prefers-reduced-motion:reduce){.tc-move,.tc.pop .tc-move,.tc.hop .tc-move{animation:none}}",
  ].join("\n");

  function injectCSS() {
    if (document.getElementById("tc-style")) return;
    var s = document.createElement("style");
    s.id = "tc-style";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function src(who, pose) {
    who = who || "amy";
    if (POSES.indexOf(pose) < 0) pose = "idle";
    return BASE + "assets/characters/" + who + "/" + who + "-" + pose + ".webp";
  }

  var loaded = {};
  function preload(who) {
    if (loaded[who]) return;
    loaded[who] = true;
    POSES.forEach(function (p) { var i = new Image(); i.decoding = "async"; i.src = src(who, p); });
  }

  function mount(el, opt) {
    injectCSS();
    opt = opt || {};
    var who = opt.who || "amy";
    var h = opt.height || 120;
    preload(who);
    var box = document.createElement("span");
    box.className = "tc";
    box.style.height = h + "px";
    box.style.width = Math.round(h * RATIO) + "px";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<span class="tc-move"><span class="tc-flip"><img alt="" decoding="async"></span></span>';
    var img = box.querySelector("img"), flip = box.querySelector(".tc-flip");
    var current = null;
    el.innerHTML = "";
    el.appendChild(box);

    function pose(name, o) {
      o = o || {};
      if (POSES.indexOf(name) < 0) name = "idle";
      var mirror = !!o.mirror;
      var key = name + (mirror ? "-m" : "");
      if (key === current) return api;
      var first = current === null;
      current = key;
      var next = src(who, name);
      var apply = function () {
        img.src = next;
        flip.classList.toggle("m", mirror);
        if (first) return;
        box.classList.remove("pop", "hop");
        void box.offsetWidth;   // restart the animation
        box.classList.add(name === "celebrate" ? "hop" : "pop");
      };
      // swap only once the picture is ready, so she never blinks out
      var probe = new Image();
      probe.onload = probe.onerror = function () { if (current === key) apply(); };
      probe.src = next;
      if (probe.complete) { probe.onload = null; apply(); }
      return api;
    }

    var api = { el: box, pose: pose, get current() { return current; } };
    pose(opt.pose || "idle", { mirror: opt.mirror });
    return api;
  }

  window.TouchCoach = { mount: mount, src: src, poses: POSES.slice(), ratio: RATIO, preload: preload };
})();
