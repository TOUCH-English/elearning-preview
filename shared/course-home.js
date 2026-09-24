/* =============================================================================
   TouchHome — one course home for every course
   -----------------------------------------------------------------------------
   ✅ Marco 2026-09-24, A: every course opens on the same layout as Pre-Beginner /
   Level 1 / Level 2 — course progress, one "continue" button, then a path map
   (a coloured band per unit, a disc per lesson, the unit's test last). A student
   moving between courses should find the same things in the same places; only
   the content changes.

   The three original courses still draw their own home (same look, older code);
   IPA, Speaking Bonus, Grammar Course and Grammar Path draw theirs through this.
   The course keeps every decision about ITS content — which lesson is next, what
   is unlocked, what a click does — and hands this file plain, already-translated
   strings. This file owns only the layout, so a change to the home (step 2 of the
   restructure moves the daily goal and review cards to /learn) is made once.

   Plain script, no dependencies: loaded with <script src> by the static courses
   and imported by the Grammar Course bundle. Styles are injected once.

   TouchHome.render(el, {
     progress: { label, pct, sub?, stats?: [{ v, l }] },
     cont:     { icon?, kicker, title, sub?, go?, onClick? },     // go defaults to "GO"
     goal?:    { pct, label, value, hint?, onClick? },             // onClick: e.g. change the daily target
     review?:  { kicker, title, text?, button?, onClick?, ok? },  // ok (default: no onClick) → the green "all caught up" look
     sections: [{ kicker, title, icon?, locked?, nodes: [
                  { label, state: "done"|"go"|"avail"|"locked", boss?, practised?, tag?, flag?, onClick? } ] }],
     before?:  Node | html string,     // above the map, under the cards (e.g. a course's own notice)
     after?:   Node | html string,     // under the map (e.g. a next-level teaser)
   })
============================================================================= */
(function () {
  "use strict";
  if (window.TouchHome) return;

  // The platform launcher's palette (app/globals.css --nav-*), same order as Pre-Beginner's MODCOLORS.
  var COLORS = [
    { c: "#16A394", d: "#0F7F73" },
    { c: "#3B82C4", d: "#2C659B" },
    { c: "#E0922E", d: "#B87420" },
    { c: "#D957A8", d: "#B2428A" },
    { c: "#9B5FE0", d: "#7A45BB" },
  ];
  var SIDES = ["c", "l", "c", "r", "c"];
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.3l6.4-.9L12 2.6Z" fill="currentColor"/></svg>';
  var CROWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 8.2l4.3 3.3L12 4.8l4.2 6.7 4.3-3.3-1.6 9.2a1 1 0 0 1-1 .8H6.1a1 1 0 0 1-1-.8L3.5 8.2Z" fill="currentColor"/><circle cx="12" cy="3.6" r="1.3" fill="currentColor"/><circle cx="3.2" cy="7" r="1.2" fill="currentColor"/><circle cx="20.8" cy="7" r="1.2" fill="currentColor"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A1.5 1.5 0 0 1 19 11.5v8A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H7Zm2 0h6V7.5a3 3 0 0 0-6 0V10Z" fill="currentColor"/></svg>';

  var CSS = [
    ".th{--th-sticky:58px;font-family:var(--te-font-body,'Plus Jakarta Sans',sans-serif);color:var(--te-ink,#16202E);padding-bottom:32px}",
    ".th *{box-sizing:border-box}",
    ":where(.th) button{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}",
    ".th-disp{font-family:var(--te-font-display,'Sora',sans-serif)}",
    // progress
    ".th-cp{position:relative;overflow:hidden;margin-top:16px;padding:22px 18px 16px;border-radius:22px;background:var(--te-surface,#fff);border:1px solid var(--te-line,#DFE5F0);box-shadow:var(--te-sh-lg,0 16px 48px rgba(14,36,86,.16))}",
    ".th-cp::before{content:'';position:absolute;inset:0 0 auto 0;height:5px;background:var(--te-brand,#15357B)}",
    ".th-cpl{font-weight:600;font-size:13.5px;color:var(--te-muted,#5C6779)}",
    ".th-pct{font-weight:700;font-size:44px;line-height:1.05;margin-top:3px;color:var(--te-brand,#15357B)}",
    ".th-pct span{font-size:23px;margin-left:2px;color:var(--te-muted,#5C6779)}",
    ".th-cpsub{font-size:12.5px;color:var(--te-muted,#5C6779);font-weight:600;margin-top:-2px}",
    ".th-bar{height:10px;border-radius:99px;background:var(--te-brand-soft,#EAF0FB);overflow:hidden;margin:11px 0 12px}",
    ".th-bar i{display:block;height:100%;border-radius:99px;background:var(--te-brand-2,#2A5BD7);transition:width .7s cubic-bezier(.2,.7,.3,1)}",
    ".th-stats{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:var(--te-muted,#5C6779);font-weight:600}",
    ".th-stats span{text-align:center;flex:1}",
    ".th-stats b{color:var(--te-ink,#16202E);font-family:var(--te-font-display,'Sora',sans-serif);font-weight:700;font-size:14px;display:block}",
    // continue
    ".th-cont{display:flex;align-items:center;gap:13px;padding:14px 15px;margin-top:12px;width:100%;text-align:left;cursor:pointer;background:var(--te-surface,#fff);border:1px solid var(--te-line,#DFE5F0);border-radius:22px;box-shadow:var(--te-sh-md);transition:transform .15s}",
    ".th-cont:active{transform:scale(.985)}",
    ".th-cont[disabled]{cursor:default}",
    ".th-cb{width:52px;height:52px;border-radius:14px;flex:none;display:grid;place-items:center;font-size:25px;background:var(--te-brand-soft,#EAF0FB);color:var(--te-brand,#15357B)}",
    ".th-cb svg{width:24px;height:24px}",
    ".th-cm{flex:1;min-width:0}",
    ".th-ck{display:block;font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--te-brand,#15357B)}",
    ".th-cm b{display:block;font-family:var(--te-font-display,'Sora',sans-serif);font-weight:600;font-size:15.5px;line-height:1.2;margin:1px 0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
    ".th-cs{display:block;font-size:12.5px;color:var(--te-muted,#5C6779);font-weight:700}",
    ".th-go{flex:none;font-weight:600;font-size:13px;color:#fff;padding:9px 16px;border-radius:999px;background:var(--te-brand,#15357B);box-shadow:0 6px 18px rgba(21,53,123,.24)}",
    // goal
    ".th-goal{display:flex;align-items:center;gap:13px;padding:13px 15px;margin-top:10px;background:var(--te-surface,#fff);border:1px solid var(--te-line,#DFE5F0);border-radius:22px;box-shadow:var(--te-sh-sm)}",
    ".th-ring{width:52px;height:52px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--te-gold,#D9B56B) var(--g,0deg),#E4E9F0 0deg)}",
    ".th-ring span{width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;font-family:var(--te-font-display,'Sora',sans-serif);font-weight:700;font-size:12px;color:var(--te-gold-deep,#BE9648)}",
    ".th-goal b{font-family:var(--te-font-display,'Sora',sans-serif);font-weight:600;font-size:14.5px;display:block}",
    "button.th-goal{width:100%;text-align:left;cursor:pointer}",
    "button.th-goal:active{transform:scale(.985)}",
    ".th-goal .th-gh{display:block;font-size:11px;color:var(--te-brand-2,#2A5BD7)}",
    ".th-goal small{font-size:12.5px;color:var(--te-muted,#5C6779);font-weight:700}",
    // review
    ".th-rev{display:flex;align-items:center;gap:13px;padding:13px 15px;margin-top:10px;border-radius:22px;background:var(--te-danger-soft,#F3E1E6);border:1px solid #E3C4CD;box-shadow:var(--te-sh-sm)}",
    ".th-rev.ok{background:var(--te-success-soft,#E6F4EE);border-color:#C5D2E2}",
    ".th-ric{width:46px;height:46px;border-radius:14px;flex:none;display:grid;place-items:center;font-size:21px;background:#fff;color:var(--te-danger,#8B1E3F)}",
    ".th-rev.ok .th-ric{color:var(--te-success-d,#3C8E6F)}",
    ".th-rt{flex:1;min-width:0}",
    ".th-rt em{display:block;font-style:normal;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--te-danger-d,#6F1730);font-weight:800}",
    ".th-rt b{display:block;font-weight:600;font-size:14.5px;margin:1px 0;color:var(--te-danger-d,#6F1730)}",
    ".th-rev.ok .th-rt em,.th-rev.ok .th-rt b{color:var(--te-brand-dd,#0D2253)}",
    ".th-rt small{font-size:12px;color:var(--te-muted,#5C6779);font-weight:700}",
    ".th-rbtn{flex:none;border:0;cursor:pointer;padding:10px 15px;font-size:13.5px;font-weight:600;border-radius:999px;color:#fff;background:var(--te-danger,#8B1E3F)}",
    ".th-rbtn.ok{background:var(--te-surface,#fff);color:var(--te-brand,#15357B);border:1px solid var(--te-line,#DFE5F0)}",
    ".th-rbtn:active{transform:scale(.97)}",
    // map
    ".th-sec{margin-top:30px}",
    ".th-band{position:sticky;top:var(--th-sticky);z-index:20;display:flex;align-items:center;gap:12px;background:var(--mc);color:#fff;border-radius:22px;padding:11px 15px;box-shadow:0 8px 22px color-mix(in srgb,var(--md) 28%,transparent)}",
    ".th-sec.locked .th-band{--mc:#E2E7EE;--md:#C9D1DC;color:#8A94A3}",
    ".th-bt{flex:1;min-width:0}",
    ".th-bk{display:block;font-size:10.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;opacity:.85}",
    ".th-band h3{margin:1px 0 0;font-family:var(--te-font-display,'Sora',sans-serif);font-size:16.5px;font-weight:600;line-height:1.2;color:inherit}",
    ".th-bi{font-size:21px;width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.2);display:grid;place-items:center;flex:none}",
    ".th-path{position:relative;padding:26px 0 8px;display:flex;flex-direction:column;align-items:center;gap:8px}",
    ".th-nw{position:relative;width:100%;display:flex;justify-content:center}",
    ".th-nw[data-side=l]{justify-content:flex-start;padding-left:17%}",
    ".th-nw[data-side=r]{justify-content:flex-end;padding-right:17%}",
    ".th-node{width:116px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;position:relative;background:none;border:0;padding:0;cursor:pointer;animation:th-in .45s cubic-bezier(.2,.7,.3,1.35) both}",
    ".th-disc{width:82px;height:70px;border-radius:50%;display:grid;place-items:center;color:#fff;position:relative;background:var(--mc);box-shadow:0 8px 20px color-mix(in srgb,var(--md) 34%,transparent);transition:transform .15s,box-shadow .15s}",
    ".th-disc svg{width:34px;height:34px}",
    ".th-node:active .th-disc{transform:scale(.94);box-shadow:0 3px 10px color-mix(in srgb,var(--md) 30%,transparent)}",
    ".th-node.locked{cursor:not-allowed}",
    ".th-node.locked .th-disc{background:#E2E7EE;color:#AEB9C6;box-shadow:none}",
    ".th-node.locked .th-disc svg{width:26px;height:26px}",
    ".th-node.go .th-disc::before{content:'';position:absolute;inset:-10px;border-radius:50%;border:4px solid var(--mc);opacity:.5;animation:th-ring 1.8s ease-out infinite;pointer-events:none}",
    ".th-node.done.boss .th-disc{background:var(--te-gold,#D9B56B);box-shadow:0 8px 20px rgba(190,150,72,.34)}",
    ".th-done,.th-pr{position:absolute;bottom:-5px;right:-5px;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:900;border:2px solid #fff}",
    ".th-done{background:var(--te-gold,#D9B56B);color:#5A3A1E}",
    ".th-node.done.boss .th-done{background:var(--te-success,#4FAE8A);color:#fff}",
    ".th-pr{background:#fff;color:var(--md);border-color:var(--mc);font-size:14px}",
    ".th-nm{font-family:var(--te-font-display,'Sora',sans-serif);font-weight:600;font-size:12.5px;line-height:1.2;color:var(--md)}",
    ".th-node.locked .th-nm{color:var(--te-subtle,#8C97A8)}",
    ".th-tag{font-size:10.5px;font-weight:800;color:var(--md);background:#fff;border:1.5px solid var(--mc);border-radius:99px;padding:1px 8px;margin-top:-4px}",
    ".th-conn{width:5px;height:26px;border-radius:9px;background:repeating-linear-gradient(180deg,#D5DCE6 0 6px,transparent 6px 12px)}",
    ".th-flag{position:absolute;left:50%;top:-16px;transform:translateX(-50%);background:var(--md);color:#fff;font-weight:700;font-size:10.5px;padding:4px 12px;border-radius:99px;box-shadow:0 3px 8px rgba(27,36,51,.25);letter-spacing:.8px;z-index:2;white-space:nowrap;animation:th-bob 2.6s ease-in-out infinite}",
    ".th-boss{position:absolute;top:-7px;right:6px;background:var(--te-gold,#D9B56B);color:#5A3A1E;font-size:10px;font-weight:800;padding:2.5px 8px;border-radius:99px;letter-spacing:.4px;z-index:2}",
    "@keyframes th-in{from{opacity:0;transform:scale(.5) translateY(10px)}to{opacity:1;transform:none}}",
    "@keyframes th-ring{0%{transform:scale(.85);opacity:.55}70%,100%{transform:scale(1.12);opacity:0}}",
    "@keyframes th-bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-5px)}}",
    "@media (hover:hover){.th-cont:hover{transform:translateY(-2px)}.th-node:not(.locked):hover .th-disc{transform:translateY(-4px)}}",
    "@media (prefers-reduced-motion:reduce){.th-node,.th-flag,.th-node.go .th-disc::before{animation:none}.th-cont,.th-disc{transition:none}}",
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

  function render(el, spec) {
    injectCSS();
    spec = spec || {};
    var p = spec.progress || { label: "", pct: 0 };
    var pct = Math.max(0, Math.min(100, Math.round(p.pct || 0)));
    var h = '<div class="th">';

    h += '<div class="th-cp"><div class="th-cpl">' + esc(p.label) + '</div>' +
      '<div class="th-pct th-disp">' + pct + "<span>%</span></div>" +
      (p.sub ? '<div class="th-cpsub">' + esc(p.sub) + "</div>" : "") +
      '<div class="th-bar"><i style="width:' + pct + '%"></i></div>' +
      (p.stats && p.stats.length
        ? '<div class="th-stats">' + p.stats.map(function (s) { return "<span><b>" + esc(s.v) + "</b>" + esc(s.l) + "</span>"; }).join("") + "</div>"
        : "") +
      "</div>";

    var c = spec.cont;
    if (c) {
      h += '<button type="button" class="th-cont" data-th="cont"' + (c.onClick ? "" : " disabled") + ">" +
        '<span class="th-cb">' + (c.icon ? esc(c.icon) : STAR) + "</span>" +
        '<span class="th-cm"><span class="th-ck">' + esc(c.kicker) + "</span><b>" + esc(c.title) + "</b>" +
        (c.sub ? '<span class="th-cs">' + esc(c.sub) + "</span>" : "") + "</span>" +
        '<span class="th-go">' + esc(c.go || "GO") + "</span></button>";
    }

    var g = spec.goal;
    if (g) {
      var gp = Math.max(0, Math.min(100, Math.round(g.pct || 0)));
      var gt = g.onClick ? "button" : "div";
      h += "<" + gt + (g.onClick ? ' type="button" data-th="goal"' : "") + ' class="th-goal"><span class="th-ring" style="--g:' + gp * 3.6 + 'deg"><span>' + gp + "%</span></span>" +
        "<span><b>" + esc(g.label) + "</b><small>" + esc(g.value) + "</small>" +
        (g.hint ? '<small class="th-gh">' + esc(g.hint) + "</small>" : "") + "</span></" + gt + ">";
    }

    var r = spec.review;
    if (r) {
      var ok = r.ok != null ? !!r.ok : !r.onClick;
      h += '<div class="th-rev' + (ok ? " ok" : "") + '"><span class="th-ric">' + (ok ? "✓" : "↻") + "</span>" +
        '<span class="th-rt"><em>' + esc(r.kicker) + "</em><b>" + esc(r.title) + "</b>" +
        (r.text ? "<small>" + esc(r.text) + "</small>" : "") + "</span>" +
        (!r.onClick ? "" : '<button type="button" class="th-rbtn' + (ok ? " ok" : "") + '" data-th="review">' + esc(r.button || "") + "</button>") + "</div>";
    }

    h += '<div data-th="before"></div><div class="th-map">';
    var gi = 0;
    (spec.sections || []).forEach(function (sec, si) {
      var col = COLORS[si % COLORS.length];
      var nodes = sec.nodes || [];
      h += '<section class="th-sec' + (sec.locked ? " locked" : "") + '" style="--mc:' + col.c + ";--md:" + col.d + '">' +
        '<div class="th-band"><div class="th-bt"><span class="th-bk">' + esc(sec.kicker) + "</span><h3>" + esc(sec.title) + "</h3></div>" +
        (sec.icon ? '<span class="th-bi">' + esc(sec.icon) + "</span>" : "") + "</div><div class=\"th-path\">";
      nodes.forEach(function (n, ni) {
        if (ni > 0) h += '<div class="th-conn"></div>';
        var st = n.state || "avail";
        var cls = "th-node " + st + (n.boss ? " boss" : "");
        var icon = st === "locked" ? LOCK : n.boss ? CROWN : STAR;
        var badge = st === "done" ? '<span class="th-done">✓</span>' : n.practised ? '<span class="th-pr">↻</span>' : "";
        var flag = n.flag ? '<span class="th-flag">' + esc(n.flag) + "</span>" : "";
        // The flag and the BOSS tag sit in the same spot; the crown already says boss.
        var boss = n.boss && st !== "done" && !n.flag ? '<span class="th-boss">BOSS</span>' : "";
        h += '<div class="th-nw" data-side="' + SIDES[ni % SIDES.length] + '">' +
          '<button type="button" class="' + cls + '" data-th="node" data-s="' + si + '" data-n="' + ni + '"' +
          (st === "locked" && !n.onClick ? " disabled" : "") + ' style="animation-delay:' + Math.min(gi * 45, 700) + 'ms">' +
          flag + '<span class="th-disc">' + icon + badge + boss + "</span>" +
          '<span class="th-nm">' + esc(n.label) + "</span>" +
          (n.tag ? '<span class="th-tag">' + esc(n.tag) + "</span>" : "") + "</button></div>";
        gi++;
      });
      h += "</div></section>";
    });
    h += '</div><div data-th="after"></div></div>';

    el.innerHTML = h;
    var root = el.firstChild;
    place(root.querySelector('[data-th="before"]'), spec.before);
    place(root.querySelector('[data-th="after"]'), spec.after);
    if (c && c.onClick) root.querySelector('[data-th="cont"]').onclick = c.onClick;
    if (g && g.onClick) root.querySelector('[data-th="goal"]').onclick = g.onClick;
    if (r && r.onClick) root.querySelector('[data-th="review"]').onclick = r.onClick;
    root.querySelectorAll('[data-th="node"]').forEach(function (b) {
      var n = spec.sections[+b.dataset.s].nodes[+b.dataset.n];
      if (n.onClick) b.onclick = function () { n.onClick(b); };
    });
    return root;
  }

  window.TouchHome = { render: render, colors: COLORS };
})();
