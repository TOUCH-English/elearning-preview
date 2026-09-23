/* =============================================================================
   TOUCH E-learning — 手感层  (shared/motion.js)
   -----------------------------------------------------------------------------
   为什么有这个档案：

   原本课程里的动画都是 CSS transition／@keyframes —— 固定长度、播完才停。
   学生在手机上拖一个面板，画面会等动画播完才理他，感觉「卡」。
   而且按钮要等 click 才有反应，手指压下去的那一刻是死的。

   这里做三件事（都来自 Apple 的 Designing Fluid Interfaces）：

     1. 按下去当下就有回馈（pointerdown，不是 click），滑开 10px 会取消。
     2. 弹簧动画：随时可以被打断、被反向，而且是从「画面上现在的位置」接手，
        不是从逻辑上的目标值 —— 否则打断的那一刻会跳一下。
     3. 拖放开时把手指的速度交给弹簧，并且用速度去「预测」会停在哪里。
        这样轻轻一甩就能把面板丢出去，而不是手指放开、东西就停住。

   -----------------------------------------------------------------------------
   用法（传统 script，file:// 也载得到，跟 storage.js／profile.js 一样）：

       <script src="../../shared/motion.js"></script>

       按下去的回馈 —— 不用写 JS，加个 class 就好：
           <button class="te-pressable">…</button>
           <a class="te-pressable te-card-press">…</a>       ← 整张卡片压少一点

       弹簧：
           TouchMotion.spring({from:0, to:1, velocity:0, onFrame:v=>…, onDone:()=>…})
           → 回传一个可以 .stop() 的 handle；对同一个元素再叫一次会自动接手

       底部面板（可以拖下去关掉）：
           TouchMotion.sheet(el, { onDismiss(){ … } })

   减少动态偏好（prefers-reduced-motion）开着时，弹簧会直接跳到终点、
   面板改成淡入淡出 —— 回馈还在，只是不再有位移。
============================================================================= */

(function (global) {
  "use strict";

  var doc = global.document;
  if (!doc) return;

  var reduce = (function () {
    try { return global.matchMedia("(prefers-reduced-motion: reduce)"); }
    catch (e) { return { matches: false, addEventListener: function () {} }; }
  })();

  /* ===========================================================================
     1. 按下去的回馈
     ---------------------------------------------------------------------------
     用事件委派挂在 document 上 —— 课程里的画面是 JS 动态产生的，
     一个一个元素去绑会漏掉後来才出现的按钮。

     hysteresis（10px）跟 iOS 一样：手指按下去之後滑开超过这个距离就取消，
     滑回来又会亮起来。按错了可以救，学生不会因为手滑就送出答案。
  =========================================================================== */

  var HYST = 10;                 // 取消的距离（px）
  var press = null;              // { el, id, x, y }

  function pressOn(el)  { if (el) el.setAttribute("data-pressed", ""); }
  function pressOff(el) { if (el) el.removeAttribute("data-pressed"); }

  function target(node) {
    for (var el = node; el && el !== doc.body; el = el.parentElement) {
      if (el.classList && el.classList.contains("te-pressable")) return el;
    }
    return null;
  }

  doc.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;   // 只理左键
    var el = target(e.target);
    if (!el || el.hasAttribute("disabled")) return;
    press = { el: el, id: e.pointerId, x: e.clientX, y: e.clientY };
    pressOn(el);
  }, { passive: true });

  doc.addEventListener("pointermove", function (e) {
    if (!press || e.pointerId !== press.id) return;
    var far = Math.abs(e.clientX - press.x) > HYST || Math.abs(e.clientY - press.y) > HYST;
    if (far) pressOff(press.el); else pressOn(press.el);
  }, { passive: true });

  function endPress(e) {
    if (!press || (e && e.pointerId !== press.id)) return;
    pressOff(press.el);
    press = null;
  }
  doc.addEventListener("pointerup", endPress, { passive: true });
  doc.addEventListener("pointercancel", endPress, { passive: true });
  /* 手指还按着就换页／切到别的 app：不清掉的话回来会看到一个卡在按下状态的按钮 */
  global.addEventListener("blur", endPress);
  doc.addEventListener("visibilitychange", function () { if (doc.hidden) endPress(); });

  /* 键盘：空白／Enter 也该有一样的回馈，不然键盘使用者按了像没反应 */
  doc.addEventListener("keydown", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    var el = target(doc.activeElement);
    if (el) pressOn(el);
  });
  doc.addEventListener("keyup", function () {
    var el = target(doc.activeElement);
    if (el) pressOff(el);
  });

  /* ===========================================================================
     2. 弹簧
     ---------------------------------------------------------------------------
     参数刻意不用物理三件套（质量／硬度／阻尼），改成 Apple 给设计师的两个：

       bounce    0   ＝不回弹（critically damped），预设
                 .2  ＝一点回弹，只有手势带了动量才用
       response  到位的快慢（秒）。这不是「动画长度」—— 弹簧没有固定长度。

     velocity 是「每秒多少个单位」，单位跟 from／to 一样（通常是 px/s）。
     打断时不要从目标值重新开始，要从现在的位置 ＋ 现在的速度接手，
     否则反向的那一刻会撞到一面墙。
  =========================================================================== */

  var running = [];   // 正在跑的弹簧（给 stopFor 找同一个元素用）

  function spring(opt) {
    var from     = opt.from || 0;
    var to       = (opt.to === undefined) ? 0 : opt.to;
    var bounce   = (opt.bounce === undefined) ? 0 : opt.bounce;
    var response = (opt.response === undefined) ? .4 : opt.response;
    var onFrame  = opt.onFrame || function () {};
    var onDone   = opt.onDone  || function () {};
    var el       = opt.el || null;

    if (el) stopFor(el);

    /* 减少动态：不做位移，直接给终点。回馈由颜色／透明度负责（见 theme.css） */
    if (reduce.matches) { onFrame(to); onDone(); return { stop: function () {}, retarget: function () {} }; }

    var v = opt.velocity || 0;
    var x = from;

    /* bounce → damping ratio；response → 角频率。这是 Apple 两参数模型的换算 */
    var zeta  = Math.max(0, 1 - bounce);
    var omega = (2 * Math.PI) / Math.max(.05, response);

    var handle = { el: el, stop: stop, retarget: retarget, done: false };
    running.push(handle);

    var last = 0, raf = 0, frames = 0;

    function step(now) {
      if (handle.done) return;
      frames++;
      if (!last) last = now;
      var dt = Math.min(.064, (now - last) / 1000);   // 切页回来会有一个巨大的 dt，要夹住
      last = now;

      /* 半隐式欧拉，但要切成小步（每步最多 4ms）再积分。
         直接用一整帧（16.7ms）去算，数值上会自己多出一份阻尼 ——
         bounce 0.2 本来该看得到的那一下回弹会被吃掉剩 0.1px，等於没有。 */
      var steps = Math.max(1, Math.ceil(dt / .004));
      var h = dt / steps;
      for (var s = 0; s < steps; s++) {
        var a = -omega * omega * (x - to) - 2 * zeta * omega * v;
        v += a * h;
        x += v * h;
      }

      /* 够近 ＋ 够慢就收工，免得永远在抖最後 0.01px */
      if (Math.abs(x - to) < .25 && Math.abs(v) < 2) {
        x = to; onFrame(x); finish(); return;
      }
      onFrame(x);
      raf = global.requestAnimationFrame(step);
    }
    raf = global.requestAnimationFrame(step);

    /* 看门狗：有些情况画面没「隐藏」，但 requestAnimationFrame 一样被压住
       （被嵌在 iframe 里而且卷出画面外时，Chrome 就会这样）。
       1.5 秒都还没跑到几帧，就认定动不了，直接给终点 —— 宁可没有动画，
       也不要让学生看到一个卡在半路、按不到的面板。 */
    var watchdog = global.setTimeout(function () {
      if (!handle.done && frames < 3) handle.finishNow();
    }, 1500);

    function finish() {
      if (handle.done) return;
      handle.done = true;
      global.clearTimeout(watchdog);
      global.cancelAnimationFrame(raf);
      var i = running.indexOf(handle);
      if (i >= 0) running.splice(i, 1);
      onDone();
    }
    function stop() {
      if (handle.done) return;
      handle.done = true;
      global.clearTimeout(watchdog);
      global.cancelAnimationFrame(raf);
      var i = running.indexOf(handle);
      if (i >= 0) running.splice(i, 1);
    }
    /* 换目标但保留现在的位置和速度 —— 这是「可以中途反向」的关键 */
    function retarget(next, nextBounce) {
      to = next;
      if (nextBounce !== undefined) zeta = Math.max(0, 1 - nextBounce);
    }

    /* 立刻跳到终点并跑完 onDone —— 给「画面被隐藏」用的逃生门 */
    handle.finishNow = function () {
      if (handle.done) return;
      x = to; v = 0; onFrame(to); finish();
    };
    handle.value = function () { return x; };
    handle.speed = function () { return v; };
    return handle;
  }

  function stopFor(el) {
    for (var i = running.length - 1; i >= 0; i--) {
      if (running[i].el === el) running[i].stop();
    }
  }

  /* 切到别的 app／别的分页时，浏览器会把 requestAnimationFrame 停掉。
     停在半路的弹簧＝学生回来看到一个卡在画面中间、推不动的面板
     （旧版的答题回馈面板就是这样卡住的）。
     所以画面一隐藏就把还在跑的弹簧直接送到终点。 */
  doc.addEventListener("visibilitychange", function () {
    if (!doc.hidden) return;
    for (var i = running.length - 1; i >= 0; i--) running[i].finishNow();
  });

  /* ===========================================================================
     3. 动量预测
     ---------------------------------------------------------------------------
     手指放开时不要看「现在在哪里」，要看「照这个速度会滑到哪里」，
     再从那个预测点去挑最近的落点。这就是轻轻一甩能把东西丢出去的原因。

     0.998 是一般卷动的减速率，0.99 比较俐落。
     注意：不是教科书的 v²/(2a)，Apple 用的是指数衰减这一条。
  =========================================================================== */

  function project(velocity, decelerationRate) {
    var d = (decelerationRate === undefined) ? .998 : decelerationRate;
    return (velocity / 1000) * d / (1 - d);
  }

  /* ===========================================================================
     4. 速度追踪
     ---------------------------------------------------------------------------
     只看最後一次 pointermove 算出来的速度会很跳（一帧的抖动就毁了）。
     留最近 100ms 的轨迹，用头尾去算。
  =========================================================================== */

  function tracker() {
    var pts = [];
    return {
      add: function (value) {
        var t = (global.performance ? performance.now() : Date.now());
        pts.push({ v: value, t: t });
        while (pts.length > 2 && t - pts[0].t > 100) pts.shift();
      },
      velocity: function () {
        if (pts.length < 2) return 0;
        var a = pts[0], b = pts[pts.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt <= 0) return 0;
        return (b.v - a.v) / dt;      // 单位／秒
      },
      reset: function () { pts.length = 0; }
    };
  }

  /* ===========================================================================
     5. 橡皮筋
     ---------------------------------------------------------------------------
     拖到边界不要硬停 —— 硬停看起来像「画面死了」，
     越拖越重才看得出「还活着，只是没有更多了」。
  =========================================================================== */

  function rubberband(overshoot, dimension, constant) {
    var c = (constant === undefined) ? .55 : constant;
    var d = dimension || 1;
    return (overshoot * d * c) / (d + c * Math.abs(overshoot));
  }

  /* ===========================================================================
     6. 底部面板
     ---------------------------------------------------------------------------
     语言闸、学生资料这些「从底下升起来」的画面用这个。
     进出走同一条路（从底下来、往底下走），学生才知道东西去了哪里。

     可以用手指拖下去关掉：拖的时候 1:1 跟着手指，往上拖会越拖越重（橡皮筋），
     放开时用速度预测 —— 甩得够快就关掉，不够快就弹回去。
     关键是「速度的方向」比「位置」重要：拖到一半但往上甩，应该弹回去。
  =========================================================================== */

  function sheet(el, opt) {
    opt = opt || {};
    var onDismiss = opt.onDismiss || function () {};
    var scrim     = opt.scrim || null;
    var handleSel = opt.handle || null;          // 只有某一块可以拖（例如上面的把手）
    var vt        = tracker();
    var drag      = null;                        // { id, startY, grabAt, h }
    var live      = null;                        // 正在跑的弹簧

    function height() { return el.offsetHeight || 1; }
    function set(y) {
      el.style.transform = "translate3d(0," + y + "px,0)";
      if (scrim) {
        var p = 1 - Math.min(1, Math.max(0, y / height()));
        scrim.style.opacity = String(p);
      }
    }
    function now() {
      var m = /translate3d\(0px,\s*(-?[\d.]+)px/.exec(el.style.transform || "");
      return m ? parseFloat(m[1]) : 0;
    }

    function open() {
      el.style.willChange = "transform";
      if (reduce.matches) { set(0); return; }
      set(height());
      live = spring({ el: el, from: height(), to: 0, velocity: 0, bounce: .12, response: .34,
                      onFrame: set, onDone: function(){ el.style.willChange = ""; } });
    }

    function close(velocity) {
      el.style.willChange = "transform";
      if (reduce.matches) { set(height()); onDismiss(); return; }
      live = spring({ el: el, from: now(), to: height(), velocity: velocity || 0,
                      bounce: 0, response: .3, onFrame: set,
                      onDone: function () { el.style.willChange = ""; onDismiss(); } });
    }

    function grabbable(node) {
      if (!handleSel) return true;
      for (var n = node; n && n !== el; n = n.parentElement) {
        if (n.matches && n.matches(handleSel)) return true;
      }
      return false;
    }

    el.addEventListener("pointerdown", function (e) {
      /* 输入框、按钮不要抢走 —— 学生要打字，不是要拖面板 */
      if (e.target.closest("input,textarea,select,button,a")) return;
      if (!grabbable(e.target)) return;

      /* 中途抓住正在跑的弹簧：从画面上现在的位置接手，不是从目标值 */
      var at = now();
      if (live) { live.stop(); live = null; }

      drag = { id: e.pointerId, startY: e.clientY, grabAt: at, h: height() };
      vt.reset(); vt.add(e.clientY);
      /* 手指移出面板也还跟着。指标已经不在了会抛错，不能让它中断拖动 */
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      vt.add(e.clientY);
      var dy = e.clientY - drag.startY + drag.grabAt;
      /* 往上（负值）＝已经到顶了，越拖越重 */
      set(dy < 0 ? rubberband(dy, drag.h) : dy);
    });

    function release(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var v = vt.velocity();                     // px/s，往下为正
      var at = now();
      var d = drag; drag = null;

      /* 用速度预测会停在哪里，再决定是关掉还是弹回去 */
      var projected = at + project(v);
      var closing = projected > d.h * .5;

      el.style.willChange = "transform";
      if (closing) close(v);
      else live = spring({ el: el, from: at, to: 0, velocity: v,
                           bounce: Math.abs(v) > 60 ? .18 : 0,   /* 有甩才回弹 */
                           response: .34, onFrame: set,
                           onDone: function(){ el.style.willChange = ""; } });
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    return { open: open, close: close, set: set };
  }

  global.TouchMotion = {
    spring: spring,
    stopFor: stopFor,
    project: project,
    tracker: tracker,
    rubberband: rubberband,
    sheet: sheet,
    get reduced() { return reduce.matches; }
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
