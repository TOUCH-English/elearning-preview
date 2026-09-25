/* =============================================================================
   TouchReport — a learner's flag on a question: too easy, too hard, or wrong
   -----------------------------------------------------------------------------
   ✅ Marco 2026-09-24: the three icons on the answer sheet do something real,
   and a stray tap costs nothing. 「太简单」「太难」 wait a few seconds before
   they are sent, so the toast's Undo can take them back; 「报错」 is sent at
   once, because the learner already confirmed it on its own sheet.

   Sent to POST /api/elearning/flag (a signed-in student only; stored in
   learn_flags). Off the platform, and for staff in Student View (preview), it
   sends nothing — the toast still says 已记下, so the screen behaves the same.

     TouchReport.send({ course, kind: "easy"|"hard"|"report", ref, question?, reasons?, answer? })   // question: the text as shown
       -> { undo() }        // undo works until the delayed send goes out
============================================================================= */
(function (global) {
  "use strict";
  if (global.TouchReport) return;

  var P = global.TOUCH_PLATFORM;
  var live = !!(P && P.student && !P.preview);
  var DELAY = 5000;   // the undo window for easy / hard

  function post(item) {
    if (!live || !global.fetch) return;
    try {
      global.fetch("/api/elearning/flag", {
        method: "POST", credentials: "same-origin", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: item.course, kind: item.kind, ref: item.ref || {}, reasons: item.reasons || [], answer: item.answer == null ? null : String(item.answer), question: item.question == null ? null : String(item.question) })
      }).catch(function () {});
    } catch (e) {}
  }

  function send(item) {
    item = item || {};
    if (item.kind === "report") { post(item); return { undo: function () {} }; }
    var t = setTimeout(function () { post(item); }, DELAY);
    return { undo: function () { clearTimeout(t); } };
  }

  global.TouchReport = { send: send, live: live };
})(typeof globalThis !== "undefined" ? globalThis : window);
