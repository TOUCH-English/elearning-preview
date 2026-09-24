/* =============================================================================
   TouchHome — one course home for every course
   -----------------------------------------------------------------------------
   ✅ Marco 2026-09-24, A: every course opens on the same layout. First version
   (same day): progress card, continue card, path map. Second version (same
   evening, after Marco looked at Duolingo's web app and his own 5C deck):
   「Duolingo 的这些界面都蛮适合我想要的」「PPT里面的5c颜色是很漂亮的」.

     · the path is the first thing on screen — a slim row of numbers on top,
       no stack of cards; the page scrolls to the lesson to do next
     · coins, not labelled discs: no text under them, a tap opens a card with
       the lesson's name and the Start button (Duolingo's popover)
     · a coin's icon says what kind of lesson it is (star, mic, book, play,
       headphones, repeat, trophy)
     · colours are the 5C level colours from ppt.html — P1 amber, L1 green,
       L2 blue, L3 red, L4 navy — painted the way the deck paints them (a
       white sheen fading down, a glow in the same colour, soft blurred washes
       behind), not flat: flat fills with a dark lip read hard and dull with
       these hues, which is what he saw in the first mock
     · each unit changes colour: a course's first unit is its own level's
       colour, the next ones walk round the five (Marco: 「上面一个单元…同一个
       颜色，下面的一个单元又会换颜色，对吗？」)
     · each unit band has a Guide button (Duolingo's guidebook): the unit's
       key sentences with sound and a translation, and short tips

   The course keeps every decision about ITS content — which lesson is next,
   what is open, what a tap does — and hands this file plain, already-
   translated strings. This file owns only the layout.

   Plain script, no dependencies: loaded with <script src> by the static courses
   and imported by the Grammar Course bundle. Styles are injected once.

   TouchHome.render(el, {
     level?:   "p1"|"l1"|"l2"|"l3"|"l4",   // first unit's colour; omitted → starts at l2
     progress: { label, pct, sub?, stats? },     // pct feeds the top row; the rest is kept for old callers
     streak?:  number,                           // 🔥 in the top row
     xp?:      number,                           // ⚡ in the top row (when there is no goal)
     goal?:    { pct, label, value, short?, hint?, onClick? },   // ⚡ today/target in the top row
     review?:  { kicker, title, text?, button?, onClick?, ok?, count? },  // ↻ n in the top row when onClick
     cont?:    { ... },                          // accepted and ignored: the "go" coin is the way in now
     labels?:  { start, again, guide, back, keyPhrases, tips },
     sections: [{ kicker, title, icon?, locked?,
                  guide?: { title?, intro?, phrases?: [{ en, tr?, say? }], tips?: [string] },
                  nodes: [{ label, sub?, state: "done"|"go"|"avail"|"locked",
                            icon?: "star"|"mic"|"book"|"play"|"headphones"|"repeat"|"trophy",
                            boss?, practised?, tag?, flag?, go?, lockedText?, onClick? }] }],
     before?:  Node | html string,     // under the top row, above the map
     after?:   Node | html string,     // under the map
     assetBase?: string,               // where shared/ is, default "../../shared/"
   })
============================================================================= */
(function () {
  "use strict";
  if (window.TouchHome) return;

  // ppt.html's five level colours (--p1 --l1 --l2 --l3 --l4). ink = text on the colour.
  var FIVE = {
    p1: { c: "#EBB12A", ink: "#4A3200" },
    l1: { c: "#2E9E50", ink: "#fff" },
    l2: { c: "#1F9FE6", ink: "#fff" },
    l3: { c: "#E8472B", ink: "#fff" },
    l4: { c: "#15335E", ink: "#fff" },
  };
  var ORDER = ["p1", "l1", "l2", "l3", "l4"];
  // Serpentine offsets (px from centre), Duolingo's shape: out to one side and back.
  var X = [0, -44, -66, -44, 0, 44, 66, 44];

  var P = 'viewBox="0 0 24 24" aria-hidden="true"';
  var ICON = {
    star: '<svg ' + P + '><path d="M12 2.6l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.3l6.4-.9L12 2.6Z" fill="currentColor"/></svg>',
    check: '<svg ' + P + '><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trophy: '<svg ' + P + '><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v3H8v-3h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1Z" fill="currentColor"/></svg>',
    play: '<svg ' + P + '><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/></svg>',
    book: '<svg ' + P + '><path d="M12 6.5C10.2 5 7.6 4.5 4 4.8v13c3.6-.3 6.2.2 8 1.7 1.8-1.5 4.4-2 8-1.7v-13c-3.6-.3-6.2.2-8 1.7Zm0 0v13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    mic: '<svg ' + P + '><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    headphones: '<svg ' + P + '><path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="3" y="13" width="5" height="8" rx="2" fill="currentColor"/><rect x="16" y="13" width="5" height="8" rx="2" fill="currentColor"/></svg>',
    repeat: '<svg ' + P + '><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg ' + P + '><path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A1.5 1.5 0 0 1 19 11.5v8A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H7Zm2 0h6V7.5a3 3 0 0 0-6 0V10Z" fill="currentColor"/></svg>',
    guide: '<svg ' + P + '><path d="M7 4h11v16H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 4h6M9 12h6M9 16h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bolt: '<svg ' + P + '><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="#E2B74F"/></svg>',
    flame: '<svg ' + P + '><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9Z" fill="#F0883E"/></svg>',
    speaker: '<svg ' + P + '><path d="M4 9h4l5-4v14l-5-4H4V9Zm12 .5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg ' + P + '><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  var CSS = [
    ".th{--th-sticky:58px;position:relative;font-family:var(--te-font-body,'Plus Jakarta Sans',sans-serif);color:var(--te-ink,#16202E);padding-bottom:40px}",
    ".th *{box-sizing:border-box}",
    ":where(.th,.th-sheet) button{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}",
    // top row
    ".th-top{display:flex;justify-content:space-between;gap:6px;padding:10px 2px 4px;position:relative;z-index:2}",
    ".th-st{display:flex;align-items:center;justify-content:center;gap:5px;flex:1;min-width:0;height:38px;border-radius:14px;border:1px solid rgba(255,255,255,.85);background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-family:var(--te-font-display,'Sora',sans-serif);font-weight:700;font-size:14.5px;white-space:nowrap;padding:0 6px}",
    "button.th-st{cursor:pointer}button.th-st:active{transform:scale(.96)}",
    ".th-st svg{width:19px;height:19px;flex:none}",
    ".th-st.review{color:#8A4FD6}",
    ".th-st.xp{color:#B7892A}.th-st.streak{color:#D96A22}",
    // washes behind each unit (the deck's .m1blob). Radial gradients, not blurred
    // circles: a blur spills past the page's edge and gets cut into a straight line
    // there; a gradient fades out inside its own box.
    ".th-sec{background-image:radial-gradient(44% 30% at 80% 26%,color-mix(in srgb,var(--w1) 30%,transparent),transparent 72%),radial-gradient(46% 30% at 20% 64%,color-mix(in srgb,var(--c) 22%,transparent),transparent 72%)}",
    ".th-sec.flip{background-image:radial-gradient(44% 30% at 20% 26%,color-mix(in srgb,var(--w1) 30%,transparent),transparent 72%),radial-gradient(46% 30% at 80% 64%,color-mix(in srgb,var(--c) 22%,transparent),transparent 72%)}",
    // unit band
    ".th-sec{position:relative;margin-top:22px}",
    ".th-band{position:sticky;top:var(--th-sticky);z-index:20;display:flex;align-items:stretch;color:var(--ink);border-radius:18px;background:var(--c);background-image:linear-gradient(168deg,rgba(255,255,255,.34),rgba(255,255,255,0) 48%);box-shadow:0 16px 30px -14px var(--c),inset 0 2px 0 rgba(255,255,255,.4),inset 0 0 0 1px rgba(255,255,255,.22)}",
    ".th-bt{flex:1;min-width:0;padding:11px 15px}",
    ".th-bk{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;opacity:.85}",
    ".th-band h3{margin:2px 0 0;font-family:var(--te-font-display,'Sora',sans-serif);font-size:16.5px;font-weight:700;line-height:1.25;color:inherit}",
    ".th-gb{flex:none;align-self:center;display:grid;place-items:center;width:44px;height:44px;margin:0 10px;padding:0;border-radius:12px;border:1.5px solid color-mix(in srgb,var(--ink) 35%,transparent);background:rgba(255,255,255,.16);font-weight:800;font-size:13px;cursor:pointer;color:var(--ink)}",
    ".th-gb:active{transform:scale(.95)}",
    ".th-gb svg{width:22px;height:22px}",
    ".th-sec.locked .th-band{--c:#DDE2EA;--ink:#7E8A9B;box-shadow:none}",
    // path
    ".th-path{position:relative;padding:64px 0 10px;display:flex;flex-direction:column;align-items:center;gap:22px}",
    ".th-nw{position:relative;width:72px;height:66px;z-index:2}",
    ".th-node{position:absolute;inset:0;border:0;padding:0;background:none;cursor:pointer;animation:th-in .45s cubic-bezier(.2,.7,.3,1.35) both}",
    ".th-coin{position:absolute;left:0;right:0;top:0;height:58px;border-radius:50%;display:grid;place-items:center;color:#fff;background:var(--c);background-image:linear-gradient(168deg,rgba(255,255,255,.42),rgba(255,255,255,0) 52%);box-shadow:0 8px 0 color-mix(in srgb,var(--c) 70%,#000),0 16px 26px -6px var(--c),inset 0 2px 0 rgba(255,255,255,.5);transition:transform .12s,box-shadow .12s}",
    ".th-coin svg{width:28px;height:28px}",
    ".th-node:active .th-coin{transform:translateY(6px);box-shadow:0 2px 0 color-mix(in srgb,var(--c) 70%,#000),0 6px 14px -6px var(--c),inset 0 2px 0 rgba(255,255,255,.5)}",
    ".th-node.avail .th-coin,.th-node.locked .th-coin{background:rgba(255,255,255,.82);background-image:none;color:#B3BDCA;box-shadow:0 8px 0 #D5DBE5,0 12px 20px -10px rgba(20,33,50,.25),inset 0 0 0 1.5px rgba(255,255,255,.95)}",
    ".th-node.avail:active .th-coin,.th-node.locked:active .th-coin{box-shadow:0 2px 0 #D5DBE5,inset 0 0 0 1.5px #fff}",
    ".th-node.locked .th-coin svg{width:22px;height:22px}",
    ".th-node.go::before{content:'';position:absolute;left:-11px;right:-11px;top:-11px;height:88px;border-radius:50%;border:7px solid color-mix(in srgb,var(--c) 28%,#fff);pointer-events:none}",
    // …and a wave that keeps leaving it, so the lesson to do next is alive on the page
    // (Marco 2026-09-24: 「外面的圈圈，它可不可以有一点动态感？」)
    ".th-node.go::after{content:'';position:absolute;left:-11px;right:-11px;top:-11px;height:88px;border-radius:50%;border:5px solid var(--c);pointer-events:none;animation:th-wave 1.8s cubic-bezier(.25,.6,.35,1) infinite}",
    ".th-node.done.boss .th-coin{--c:#E2B23B}",
    ".th-pr{position:absolute;right:-4px;top:-4px;width:24px;height:24px;border-radius:50%;background:#fff;color:color-mix(in srgb,var(--c) 70%,#000);display:grid;place-items:center;font-size:13px;font-weight:900;box-shadow:0 2px 6px rgba(20,33,50,.2);z-index:2}",
    ".th-tag{position:absolute;left:50%;top:-14px;transform:translateX(-50%);white-space:nowrap;background:#fff;color:color-mix(in srgb,var(--c) 75%,#000);font-size:10px;font-weight:800;padding:2px 7px;border-radius:99px;box-shadow:0 2px 6px rgba(20,33,50,.16);z-index:2}",
    ".th-bub{position:absolute;left:50%;top:-54px;transform:translateX(-50%);background:#fff;border:2px solid #E3E8EF;color:color-mix(in srgb,var(--c) 80%,#000);font-weight:800;font-size:14px;letter-spacing:.03em;padding:6px 13px;border-radius:12px;white-space:nowrap;z-index:3;animation:th-bob 2.4s ease-in-out infinite}",
    ".th-bub::after{content:'';position:absolute;left:50%;bottom:-7px;width:11px;height:11px;margin-left:-6px;background:#fff;border:2px solid #E3E8EF;border-top:0;border-left:0;transform:rotate(45deg)}",
    ".th-amy{position:absolute;width:112px;pointer-events:none;z-index:1;clip-path:inset(0 0 24% 0)}",
    // popover
    ".th-pop{position:absolute;left:14px;right:14px;z-index:30;border-radius:18px;padding:15px 16px 16px;color:var(--ink);background:var(--c);background-image:linear-gradient(168deg,rgba(255,255,255,.3),rgba(255,255,255,0) 50%);box-shadow:0 5px 0 color-mix(in srgb,var(--c) 70%,#000),0 18px 34px -10px rgba(20,33,50,.35);animation:th-pop .18s ease-out both}",
    ".th-pop::before{content:'';position:absolute;top:-8px;left:var(--ax);width:16px;height:16px;margin-left:-8px;background:var(--c);transform:rotate(45deg);border-radius:3px}",
    ".th-pop.plain{--c:#fff;--ink:#16202E;border:2px solid #E3E8EF;box-shadow:0 5px 0 #E3E8EF,0 18px 34px -10px rgba(20,33,50,.25)}",
    ".th-pop.plain::before{border-left:2px solid #E3E8EF;border-top:2px solid #E3E8EF;top:-9px}",
    ".th-pop h4{margin:0;font-family:var(--te-font-display,'Sora',sans-serif);font-size:17px;font-weight:700;line-height:1.25;color:inherit}",
    ".th-pop p{margin:4px 0 0;font-size:13px;font-weight:600;opacity:.9}",
    ".th-pgo{display:block;width:100%;margin-top:13px;border:0;border-radius:14px;padding:13px;background:#fff;color:color-mix(in srgb,var(--c) 80%,#000);font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.14)}",
    ".th-pop.plain .th-pgo{background:#EEF2F7;color:#5C6779}",
    ".th-pgo:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.14)}",
    // guide sheet
    ".th-sheet{position:fixed;inset:0;z-index:2000;background:#fff;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:var(--te-font-body,'Plus Jakarta Sans',sans-serif);color:#16202E;padding:calc(env(safe-area-inset-top) + 8px) 0 calc(env(safe-area-inset-bottom) + 30px);animation:th-up .22s ease-out both}",
    ".th-sheet *{box-sizing:border-box}",
    ".th-sh{display:flex;align-items:center;gap:8px;padding:6px 12px 10px;position:sticky;top:0;background:#fff;z-index:2}",
    ".th-sh button{width:40px;height:40px;border-radius:50%;border:0;background:#F1F4F8;display:grid;place-items:center;color:#15357B;cursor:pointer}",
    ".th-sh button svg{width:20px;height:20px}",
    ".th-sh b{font-family:var(--te-font-display,'Sora',sans-serif);font-size:16px}",
    ".th-gh{display:flex;gap:14px;align-items:center;margin:0 16px;padding:10px 0 16px;border-bottom:2px solid #EEF1F5}",
    ".th-gh img{width:70px;height:70px;border-radius:50%;object-fit:cover;object-position:50% 8%;background:color-mix(in srgb,var(--c) 22%,#fff);flex:none}",
    ".th-gh h2{margin:0;font-family:var(--te-font-display,'Sora',sans-serif);font-size:19px;line-height:1.25}",
    ".th-gh p{margin:4px 0 0;font-size:13.5px;color:#5C6779;line-height:1.45}",
    ".th-gs{margin:18px 16px 10px;font-weight:800;font-size:13px;letter-spacing:.04em;color:color-mix(in srgb,var(--c) 80%,#000)}",
    ".th-ph{display:flex;gap:10px;align-items:flex-start;margin:0 16px 10px}",
    ".th-say{flex:none;width:34px;height:34px;margin-top:4px;border-radius:50%;border:0;background:color-mix(in srgb,var(--c) 14%,#fff);color:color-mix(in srgb,var(--c) 80%,#000);display:grid;place-items:center;cursor:pointer}",
    ".th-say svg{width:17px;height:17px}",
    ".th-bx{border:2px solid #E7EBF0;border-radius:14px;padding:9px 13px;max-width:calc(100% - 44px)}",
    ".th-bx b{display:block;font-size:15.5px;font-weight:700;line-height:1.35}",
    ".th-bx small{display:block;margin-top:2px;color:#7A8698;font-size:13px;font-weight:600;line-height:1.4}",
    ".th-tip{margin:0 16px 10px;padding:11px 13px;border-radius:14px;background:#F5F8FC;font-size:14px;line-height:1.55;color:#33415C}",
    ".th-tip small{display:block;margin-top:4px;font-size:13px;color:#6B7688}",
    "@keyframes th-in{from{opacity:0;transform:scale(.6) translateY(10px)}to{opacity:1;transform:none}}",
    "@keyframes th-wave{0%{transform:scale(.96);opacity:.85}80%,100%{transform:scale(1.4);opacity:0}}",
    "@keyframes th-bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-5px)}}",
    "@keyframes th-pop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}",
    "@keyframes th-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion:reduce){.th-node,.th-bub,.th-pop,.th-sheet,.th-node.go::after{animation:none}.th-coin{transition:none}}",
  ].join("\n");

  function injectCSS() {
    if (document.getElementById("th-style")) return;
    var s = document.createElement("style");
    s.id = "th-style";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function place(host, x) {
    if (!x) return;
    if (typeof x === "string") host.insertAdjacentHTML("beforeend", x);
    else host.appendChild(x);
  }

  function colourAt(level, i) {
    var start = ORDER.indexOf(level);
    if (start < 0) start = 2;
    return FIVE[ORDER[(start + i) % ORDER.length]];
  }

  function defaults(l) {
    l = l || {};
    return {
      start: l.start || "START", again: l.again || "PRACTISE AGAIN", guide: l.guide || "Guide",
      back: l.back || "Back", keyPhrases: l.keyPhrases || "Key sentences", tips: l.tips || "Tips",
    };
  }

  function closePop(root) {
    var p = root.querySelector(".th-pop");
    if (p) { if (p.parentNode) p.parentNode.style.paddingBottom = ""; p.remove(); }
    root._popFor = null;
  }

  function openPop(root, btn, n, sec, L) {
    var same = root._popFor === btn;
    closePop(root);
    if (same) return;
    var st = n.state || "avail";
    var nw = btn.parentNode, path = nw.parentNode;
    var pop = document.createElement("div");
    var plain = st === "avail" || st === "locked";
    pop.className = "th-pop" + (plain ? " plain" : "");
    if (!plain) {
      pop.style.setProperty("--c", btn.style.getPropertyValue("--c"));
      pop.style.setProperty("--ink", btn.style.getPropertyValue("--ink"));
    }
    var go = st === "locked" && !n.onClick ? "" :
      '<button type="button" class="th-pgo">' + esc(n.go || (st === "done" ? L.again : L.start)) + "</button>";
    pop.innerHTML = "<h4>" + esc(n.label) + "</h4>" +
      (n.sub || sec.kicker ? "<p>" + esc(n.sub || sec.kicker) + "</p>" : "") +
      (st === "locked" && n.lockedText ? "<p>" + esc(n.lockedText) + "</p>" : "") + go;
    pop.style.top = (nw.offsetTop + nw.offsetHeight + 14) + "px";
    path.appendChild(pop);
    // under a unit's last coin the card would run into the next unit's band: make room
    var need = pop.offsetTop + pop.offsetHeight + 24 - path.offsetHeight;
    if (need > 0) path.style.paddingBottom = (parseFloat(getComputedStyle(path).paddingBottom) + need) + "px";
    var ax = nw.offsetLeft + nw.offsetWidth / 2 + (new DOMMatrix(getComputedStyle(nw).transform).m41 || 0) - pop.offsetLeft;
    pop.style.setProperty("--ax", Math.max(22, Math.min(pop.offsetWidth - 22, ax)) + "px");
    var b = pop.querySelector(".th-pgo");
    if (b && n.onClick) b.onclick = function (e) { e.stopPropagation(); closePop(root); n.onClick(btn); };
    root._popFor = btn;
    // keep the card on screen
    var r = pop.getBoundingClientRect();
    var vh = window.innerHeight || 700;
    if (r.bottom > vh - 90) window.scrollBy({ top: r.bottom - vh + 110, behavior: "smooth" });
  }

  function openGuide(sec, colour, L, assetBase) {
    var g = sec.guide || {};
    var sh = document.createElement("div");
    sh.className = "th-sheet";
    sh.style.setProperty("--c", colour.c);
    sh.setAttribute("role", "dialog");
    var canSay = function (p) { return !!(p.say || window.TouchVoice); };   // no voice on the page → no dead button
    var phrases = (g.phrases || []).map(function (p, i) {
      return '<div class="th-ph">' + (canSay(p) ? '<button type="button" class="th-say" data-i="' + i + '" aria-label="play">' + ICON.speaker + "</button>" : "") +
        '<div class="th-bx"><b>' + esc(p.en) + "</b>" + (p.tr ? "<small>" + esc(p.tr) + "</small>" : "") + "</div></div>";
    }).join("");
    // a tip is a string, or { text, sub } for a rule with its translation underneath
    var tips = (g.tips || []).map(function (t) {
      return '<div class="th-tip">' + (typeof t === "string" ? esc(t) : esc(t.text) + (t.sub ? "<small>" + esc(t.sub) + "</small>" : "")) + "</div>";
    }).join("");
    sh.innerHTML = '<div class="th-sh"><button type="button" aria-label="' + esc(L.back) + '">' + ICON.back + "</button><b>" + esc(g.title || L.guide) + "</b></div>" +
      '<div class="th-gh"><img alt="" src="' + esc(assetBase) + 'assets/characters/amy-coach.webp"><div><h2>' + esc(sec.title) + "</h2>" +
      (g.intro ? "<p>" + esc(g.intro) + "</p>" : "") + "</div></div>" +
      (phrases ? '<div class="th-gs">' + esc(L.keyPhrases) + "</div>" + phrases : "") +
      (tips ? '<div class="th-gs">' + esc(L.tips) + "</div>" + tips : "");
    document.body.appendChild(sh);
    var prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      try { if (window.TouchVoice) window.TouchVoice.stop(); } catch (e) {}
      document.documentElement.style.overflow = prev;
      sh.remove();
      window.removeEventListener("popstate", close);
    }
    // the phone's back gesture closes the guide rather than leaving the course
    try { history.pushState({ thGuide: 1 }, ""); window.addEventListener("popstate", close); } catch (e) {}
    sh.querySelector(".th-sh button").onclick = function () {
      if (history.state && history.state.thGuide) history.back(); else close();
    };
    sh.querySelectorAll(".th-say").forEach(function (b) {
      b.onclick = function () {
        var p = g.phrases[+b.dataset.i];
        // the whole sentence: say()'s default falls back to the browser voice only up to 3 words
        if (p.say) p.say(); else if (window.TouchVoice) window.TouchVoice.say(p.en, { fallbackMaxWords: 99 });
      };
    });
  }

  function render(el, spec) {
    injectCSS();
    spec = spec || {};
    var L = defaults(spec.labels);
    var assetBase = spec.assetBase || "../../shared/";
    var p = spec.progress || { label: "", pct: 0 };
    var pct = Math.max(0, Math.min(100, Math.round(p.pct || 0)));
    var h = '<div class="th">';

    // ---- top row: progress · today's XP (or total) · streak · review ----
    var arc = Math.max(0.5, pct * 0.534);   // 2πr for r = 8.5 is 53.4
    h += '<div class="th-top"><span class="th-st" title="' + esc(p.label) + '"><svg ' + P + '><circle cx="12" cy="12" r="8.5" fill="none" stroke="#DDE3EB" stroke-width="4"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#2A5BD7" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + arc + ' 60" transform="rotate(-90 12 12)"/></svg>' + pct + "%</span>";
    var g = spec.goal;
    if (g) {
      var gv = g.short || (String(g.value || "").match(/\d+\s*\/\s*\d+/) || [Math.round(g.pct || 0) + "%"])[0].replace(/\s+/g, "");
      h += (g.onClick ? '<button type="button" data-th="goal"' : "<span") + ' class="th-st xp" title="' + esc((g.label || "") + " · " + (g.value || "")) + '">' + ICON.bolt + esc(gv) + (g.onClick ? "</button>" : "</span>");
    } else if (spec.xp != null) {
      h += '<span class="th-st xp">' + ICON.bolt + esc(spec.xp) + "</span>";
    }
    if (spec.streak != null) h += '<span class="th-st streak">' + ICON.flame + esc(spec.streak) + "</span>";
    var r = spec.review;
    if (r && r.onClick) {
      var cnt = r.count != null ? r.count : (String(r.title || "").match(/\d+/) || [""])[0];
      h += '<button type="button" data-th="review" class="th-st review" title="' + esc(r.title) + '">' + ICON.repeat + esc(cnt || "") + "</button>";
    }
    h += "</div>";
    h += '<div data-th="before"></div><div class="th-map">';

    var gi = 0, goEl = null;
    (spec.sections || []).forEach(function (sec, si) {
      var col = colourAt(spec.level, si);
      var nodes = sec.nodes || [];
      var flip = si % 2 === 1;
      h += '<section class="th-sec' + (sec.locked ? " locked" : "") + (flip ? " flip" : "") + '" style="--c:' + col.c + ";--ink:" + col.ink + ";--w1:" + colourAt(spec.level, si + 1).c + '">' +
        '<div class="th-band"><div class="th-bt"><span class="th-bk">' + esc(sec.kicker) + "</span><h3>" + esc(sec.title) + "</h3></div>" +
        (sec.guide ? '<button type="button" class="th-gb" data-th="guide" data-s="' + si + '" aria-label="' + esc(L.guide) + '" title="' + esc(L.guide) + '">' + ICON.guide + "</button>" : "") +
        '</div><div class="th-path">';
      nodes.forEach(function (n, ni) {
        var st = n.state || "avail";
        var x = X[ni % X.length] * (flip ? -1 : 1);
        var icon = st === "done" ? ICON.check : st === "locked" ? ICON.lock : ICON[n.icon] || (n.boss ? ICON.trophy : ICON.star);
        var cls = "th-node " + st + (n.boss ? " boss" : "");
        h += '<div class="th-nw" style="transform:translateX(' + x + 'px)">' +
          '<button type="button" class="' + cls + '" data-th="node" data-s="' + si + '" data-n="' + ni + '" aria-label="' + esc(n.label) + '"' +
          ' style="--c:' + col.c + ";--ink:" + col.ink + ";animation-delay:" + Math.min(gi * 40, 600) + 'ms">' +
          (st === "go" ? '<span class="th-bub">' + esc(n.flag || L.start) + "</span>" : n.tag ? '<span class="th-tag">' + esc(n.tag) + "</span>" : "") +
          '<span class="th-coin">' + icon + "</span>" +
          (n.practised && st !== "done" ? '<span class="th-pr">↻</span>' : "") +
          "</button></div>";
        gi++;
      });
      // Amy stands beside the unit the learner is in (the one holding the next
      // lesson, or the first unit when there is none), on the side the path bends away from
      var here = nodes.some(function (n) { return n.state === "go"; }) ||
        (si === 0 && !(spec.sections || []).some(function (s) { return (s.nodes || []).some(function (n) { return n.state === "go"; }); }));
      if (here && nodes.length >= 3) {
        h += '<img class="th-amy" alt="" src="' + esc(assetBase) + 'assets/characters/amy-coach.webp" style="top:150px;' +
          (flip ? "left:0;transform:scaleX(-1)" : "right:0") + '">';
      }
      h += "</div></section>";
    });
    h += '</div><div data-th="after"></div></div>';

    el.innerHTML = h;
    var root = el.firstChild;
    place(root.querySelector('[data-th="before"]'), spec.before);
    place(root.querySelector('[data-th="after"]'), spec.after);
    if (g && g.onClick) root.querySelector('[data-th="goal"]').onclick = g.onClick;
    if (r && r.onClick) root.querySelector('[data-th="review"]').onclick = r.onClick;
    root.querySelectorAll('[data-th="guide"]').forEach(function (b) {
      var si = +b.dataset.s;
      b.onclick = function (e) { e.stopPropagation(); closePop(root); openGuide(spec.sections[si], colourAt(spec.level, si), L, assetBase); };
    });
    root.querySelectorAll('[data-th="node"]').forEach(function (b) {
      var sec = spec.sections[+b.dataset.s], n = sec.nodes[+b.dataset.n];
      if ((n.state || "avail") === "go" && !goEl) goEl = b;
      b.onclick = function (e) { e.stopPropagation(); openPop(root, b, n, sec, L); };
    });
    // a tap anywhere else closes the card
    if (!el._thOutside) {
      el._thOutside = true;
      document.addEventListener("click", function (e) {
        var rt = el.firstChild;
        if (rt && rt._popFor && !(e.target.closest && e.target.closest(".th-pop"))) closePop(rt);
      });
    }
    // open on the lesson to do next — once per page load, not on every redraw
    if (goEl && !el._thScrolled) {
      el._thScrolled = true;
      var target = goEl;
      requestAnimationFrame(function () {
        var rr = target.getBoundingClientRect();
        var vh = window.innerHeight || 700;
        if (rr.top > vh * 0.62) window.scrollTo({ top: window.scrollY + rr.top - vh * 0.42, behavior: "auto" });
      });
    }
    return root;
  }

  window.TouchHome = { render: render, colours: FIVE, colourAt: colourAt };
})();
