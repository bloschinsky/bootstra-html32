/*!
 * bootstra-irix v0.1.0 — optional behaviours (no dependencies; Bootstrap JS optional)
 *   [data-ix-thumbwheel]        draggable thumbwheel, fires "ix:change" {value}
 *   [data-ix-clock]             analog desktop clock
 *   [data-ix-scheme="name"]     click to switch colour scheme (persisted)
 *   [data-ix-drag]              window can be dragged by its title bar (≥992px)
 *   .ix-tbtn--min / --max       shade / maximize the parent .ix-window
 *   .ix-icons                   click to select, keyboard arrows supported
 *   [data-ix-view="icons|list|compact"]  view-mode buttons in .ix-vtools
 *   [data-ix-find]              "find an icon" bar that filters the view
 *   tab with data-page + [data-ix-page] in the window title: page counter
 *   [data-ix-layer]             non-window container raised when its dropdown opens
 * MIT License.
 */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "bootstra-irix:scheme";

  /* ---------- Colour schemes ---------- */
  function setScheme(name) {
    if (!name || name === "auto") root.removeAttribute("data-scheme");
    else root.setAttribute("data-scheme", name);
    try { localStorage.setItem(KEY, name || "auto"); } catch (e) {}
    document.querySelectorAll("[data-ix-scheme]").forEach(function (el) {
      var on = el.getAttribute("data-ix-scheme") === (name || "auto");
      el.classList.toggle("active", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("ix:scheme", { detail: { scheme: name || "auto" } }));
  }
  function initSchemes() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) setScheme(saved);
    document.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-ix-scheme]");
      if (el && !el.hasAttribute("data-ix-scheme-preview")) { ev.preventDefault(); setScheme(el.getAttribute("data-ix-scheme")); }
    });
  }

  /* ---------- Thumbwheel ---------- */
  function initWheel(el) {
    if (el._ix) return; el._ix = true;
    var horiz = el.classList.contains("ix-thumbwheel--h");
    var min = parseFloat(el.dataset.min || 0), max = parseFloat(el.dataset.max || 100);
    var step = parseFloat(el.dataset.step || 1);
    var value = parseFloat(el.dataset.value || min);
    el.tabIndex = 0;
    el.setAttribute("role", "slider");
    el.setAttribute("aria-orientation", horiz ? "horizontal" : "vertical");
    el.setAttribute("aria-valuemin", min); el.setAttribute("aria-valuemax", max);
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", "Thumbwheel");
    function apply(v, fire) {
      v = Math.min(max, Math.max(min, Math.round(v / step) * step));
      var changed = v !== value; value = v;
      el.dataset.value = v; el.setAttribute("aria-valuenow", v);
      el.style.setProperty("--ix-wheel-pos", ((v - min) / step * 2.333).toFixed(1) + "px");
      if (fire && changed) el.dispatchEvent(new CustomEvent("ix:change", { bubbles: true, detail: { value: v } }));
    }
    apply(value, false);
    var start = null, startVal = 0;
    el.addEventListener("pointerdown", function (e) { start = horiz ? e.clientX : e.clientY; startVal = value; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", function (e) {
      if (start === null) return;
      var d = (horiz ? e.clientX : e.clientY) - start;
      apply(startVal + (horiz ? d : -d) / 3 * step, true);
    });
    ["pointerup", "pointercancel"].forEach(function (t) { el.addEventListener(t, function () { start = null; }); });
    el.addEventListener("wheel", function (e) { e.preventDefault(); apply(value + (e.deltaY < 0 ? step : -step), true); }, { passive: false });
    el.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowUp" || k === "ArrowRight") { apply(value + step, true); e.preventDefault(); }
      if (k === "ArrowDown" || k === "ArrowLeft") { apply(value - step, true); e.preventDefault(); }
      if (k === "Home") { apply(min, true); e.preventDefault(); }
      if (k === "End") { apply(max, true); e.preventDefault(); }
    });
    el.ixSet = function (v) { apply(v, true); };
  }

  /* ---------- Clock ---------- */
  function initClock(el) {
    if (el._ix) return; el._ix = true;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("role", "img");
    var ticks = "";
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180, big = i % 3 === 0;
      var r1 = big ? 36 : 39, r2 = 44;
      ticks += '<line x1="' + (50 + r1 * Math.sin(a)).toFixed(2) + '" y1="' + (50 - r1 * Math.cos(a)).toFixed(2) +
        '" x2="' + (50 + r2 * Math.sin(a)).toFixed(2) + '" y2="' + (50 - r2 * Math.cos(a)).toFixed(2) +
        '" stroke="#e6e6ee" stroke-width="' + (big ? 4 : 2) + '"/>';
    }
    svg.innerHTML = ticks +
      '<line class="h" x1="50" y1="50" x2="50" y2="28" stroke="#e6e6ee" stroke-width="2.5"/>' +
      '<line class="m" x1="50" y1="50" x2="50" y2="14" stroke="#e6e6ee" stroke-width="1.5"/>' +
      '<line class="s" x1="50" y1="56" x2="50" y2="12" stroke="#e6e6ee" stroke-width=".8"/>';
    el.appendChild(svg);
    function tick() {
      var d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      svg.querySelector(".h").setAttribute("transform", "rotate(" + h * 30 + " 50 50)");
      svg.querySelector(".m").setAttribute("transform", "rotate(" + m * 6 + " 50 50)");
      svg.querySelector(".s").setAttribute("transform", "rotate(" + s * 6 + " 50 50)");
      svg.setAttribute("aria-label", "Clock, " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Windows: focus, drag, shade, maximize ---------- */
  var z = 10;
  function focusWin(w) {
    document.querySelectorAll(".ix-window.is-active").forEach(function (o) { if (o !== w) o.classList.remove("is-active"); });
    w.classList.add("is-active");
    if (w.hasAttribute("data-ix-drag")) raise(w);
  }
  function raise(host) {
    if (!host) return;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.style.zIndex = ++z;
  }
  function initWindows() {
    /* An open dropdown must sit above every other window */
    document.addEventListener("show.bs.dropdown", function (e) {
      raise(e.target.closest(".ix-window, [data-ix-layer]"));
    });
    document.addEventListener("pointerdown", function (e) {
      var w = e.target.closest(".ix-window"); if (w) focusWin(w);
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".ix-tbtn--min, .ix-tbtn--max"); if (!b) return;
      var w = b.closest(".ix-window");
      if (b.classList.contains("ix-tbtn--min")) w.classList.toggle("is-shaded");
      else w.classList.toggle("is-max");
      b.setAttribute("aria-pressed", w.classList.contains(b.classList.contains("ix-tbtn--min") ? "is-shaded" : "is-max"));
    });
    var drag = null;
    document.addEventListener("pointerdown", function (e) {
      var bar = e.target.closest("[data-ix-drag] > .ix-titlebar");
      if (!bar || e.target.closest("button") || !window.matchMedia("(min-width: 992px)").matches) return;
      var w = bar.parentElement;
      if (w.classList.contains("is-max")) return;
      var m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(w.style.transform || "");
      drag = { w: w, x: e.clientX, y: e.clientY, tx: m ? +m[1] : 0, ty: m ? +m[2] : 0 };
      w.classList.add("is-dragging"); bar.setPointerCapture(e.pointerId); e.preventDefault();
    });
    document.addEventListener("pointermove", function (e) {
      if (!drag) return;
      drag.w.style.transform = "translate(" + (drag.tx + e.clientX - drag.x) + "px," + (drag.ty + e.clientY - drag.y) + "px)";
    });
    document.addEventListener("pointerup", function () { if (drag) { drag.w.classList.remove("is-dragging"); drag = null; } });
  }

  /* ---------- Icon views: selection ---------- */
  function initIcons() {
    document.addEventListener("click", function (e) {
      var ic = e.target.closest(".ix-icon, .ix-desk-icon");
      var scope = e.target.closest(".ix-icons, .ix-desk-icons");
      if (!scope) return;
      scope.querySelectorAll(".is-selected").forEach(function (o) { o.classList.remove("is-selected"); o.setAttribute("aria-selected", "false"); });
      if (ic) { ic.classList.add("is-selected"); ic.setAttribute("aria-selected", "true"); }
    });
    document.addEventListener("keydown", function (e) {
      var ic = e.target.closest && e.target.closest(".ix-icons .ix-icon"); if (!ic) return;
      var all = Array.prototype.slice.call(ic.closest(".ix-icons").querySelectorAll(".ix-icon"));
      var i = all.indexOf(ic), n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = all[i + 1];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = all[i - 1];
      if (n) { n.focus(); n.click(); e.preventDefault(); }
    });
  }

  /* ---------- View modes, find bar, page counters ---------- */
  function viewScope(btn) { return btn.closest(".ix-viewframe") || btn.closest(".ix-window") || document; }
  function initViews() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-ix-view]");
      if (b) {
        var mode = b.getAttribute("data-ix-view"), tools = b.closest(".ix-vtools") || b.parentElement;
        tools.querySelectorAll("[data-ix-view]").forEach(function (o) {
          var on = o === b; o.classList.toggle("active", on); o.setAttribute("aria-pressed", on);
        });
        viewScope(b).querySelectorAll(".ix-icons").forEach(function (g) {
          g.classList.toggle("ix-icons--list", mode === "list");
          g.classList.toggle("ix-icons--compact", mode === "compact");
        });
        return;
      }
      var f = e.target.closest("[data-ix-find]");
      if (f) toggleFind(f);
    });
  }
  function toggleFind(btn) {
    var scope = viewScope(btn), view = scope.querySelector(".ix-view"), bar = scope.querySelector(".ix-findbar");
    if (bar) { bar.remove(); filter(scope, ""); btn.classList.remove("active"); btn.setAttribute("aria-pressed", "false"); return; }
    bar = document.createElement("div");
    bar.className = "ix-findbar";
    bar.innerHTML = '<label>Find</label><input class="form-control form-control-sm" type="search" placeholder="Icon name" aria-label="Find an icon"><span class="ix-findbar-count"></span>';
    view.insertBefore(bar, view.firstChild);
    btn.classList.add("active"); btn.setAttribute("aria-pressed", "true");
    var input = bar.querySelector("input");
    input.addEventListener("input", function () { filter(scope, input.value); });
    input.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggleFind(btn); btn.focus(); } });
    input.focus();
  }
  function filter(scope, q) {
    q = q.trim().toLowerCase(); var shown = 0, total = 0;
    scope.querySelectorAll(".ix-icons .ix-icon").forEach(function (ic) {
      if (ic.closest(".tab-pane:not(.active)")) return;
      var name = (ic.querySelector("span") || ic).textContent.toLowerCase(), hit = !q || name.indexOf(q) > -1;
      ic.hidden = !hit; total++; if (hit) shown++;
    });
    var c = scope.querySelector(".ix-findbar-count");
    if (c) c.textContent = q ? (shown ? shown + " of " + total : "No icons named “" + q + "”") : "";
  }
  document.addEventListener("shown.bs.tab", function (e) {
    var p = e.target.getAttribute("data-page"), w = e.target.closest(".ix-window");
    var label = p && w && w.querySelector("[data-ix-page]");
    if (label) label.textContent = p;
    var input = w && w.querySelector(".ix-findbar input");
    if (input) filter(viewScope(input), input.value);
  });

  function init() {
    document.querySelectorAll("[data-ix-thumbwheel], .ix-thumbwheel").forEach(initWheel);
    document.querySelectorAll("[data-ix-clock]").forEach(initClock);
  }
  initSchemes(); initWindows(); initIcons(); initViews();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.BootstraIrix = { setScheme: setScheme, init: init, initWheel: initWheel, initClock: initClock };
})();
