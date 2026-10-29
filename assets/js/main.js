// SimplPrint website: theme, menu, reveal on scroll, screenshot gallery and the two interactive demos.
// Texts come from data attributes in the page, so the Russian and English pages share this file.
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------ theme (remembered per browser)
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  var saved = storedTheme();
  if (saved === "light" || saved === "dark") doc.setAttribute("data-theme", saved);
  var themeButton = document.querySelector(".theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var dark = doc.getAttribute("data-theme")
        ? doc.getAttribute("data-theme") === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  }

  // ------------------------------------------------------------ menu on phones
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  // ------------------------------------------------------------ reveal on scroll
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealed.forEach(function (el) {
      // What is already on screen shows at once; the rest as it scrolls into view.
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("visible");
      else observer.observe(el);
    });
  } else {
    revealed.forEach(function (el) { el.classList.add("visible"); });
  }

  // ------------------------------------------------------------ gallery tabs and lightbox
  var tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", String(t === tab)); });
      document.querySelectorAll(".gallery__panel").forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("data-tab");
      });
    });
  });
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var big = lightbox.querySelector("img");
    document.querySelectorAll("[data-zoom]").forEach(function (img) {
      img.addEventListener("click", function () {
        big.src = img.getAttribute("data-zoom");
        big.alt = img.alt;
        lightbox.classList.add("open");
      });
    });
    lightbox.addEventListener("click", function () { lightbox.classList.remove("open"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  // ------------------------------------------------------------ helpers for the SVG demos
  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, parent) {
    var node = document.createElementNS(NS, name);
    for (var key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }
  function fmt(value, digits) {
    var lang = doc.lang || "ru";
    return value.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  // ------------------------------------------------------------ demo 1: measuring on the page
  var measureDemo = document.getElementById("measure-demo");
  if (measureDemo) setupMeasure(measureDemo);

  function setupMeasure(stage) {
    var mm = stage.getAttribute("data-mm");
    var svg = el("svg", { viewBox: "-16 -16 232 320", role: "img", "aria-label": stage.getAttribute("data-label") }, null);
    stage.insertBefore(svg, stage.firstChild);

    // Paper, grid and rulers (millimeters of the paper).
    el("rect", { x: 0, y: 0, width: 210, height: 297, class: "paper", "stroke-width": 0.4 }, svg);
    var grid = el("g", {}, svg);
    for (var x = 5; x < 210; x += 5) el("line", { x1: x, y1: 0, x2: x, y2: 297, class: x % 10 ? "gridline" : "gridline gridline--major", "stroke-width": 0.2 }, grid);
    for (var y = 5; y < 297; y += 5) el("line", { x1: 0, y1: y, x2: 210, y2: y, class: y % 10 ? "gridline" : "gridline gridline--major", "stroke-width": 0.2 }, grid);
    var rulers = el("g", { fill: "currentColor", "font-size": 4.2, "font-family": "Segoe UI, sans-serif" }, svg);
    for (var r = 0; r <= 210; r += 5) {
      el("line", { x1: r, y1: -1, x2: r, y2: r % 10 ? -3 : -5, stroke: "currentColor", "stroke-width": 0.3 }, rulers);
      if (r % 20 === 0 && r > 0) el("text", { x: r + 0.8, y: -6 }, rulers).textContent = r;
    }
    for (var c = 0; c <= 297; c += 5) {
      el("line", { x1: -1, y1: c, x2: c % 10 ? -3 : -5, y2: c, stroke: "currentColor", "stroke-width": 0.3 }, rulers);
      if (c % 20 === 0 && c > 0) el("text", { x: -15, y: c + 1.5 }, rulers).textContent = c;
    }

    // The drawing; scaled to 97.1 % for "ordinary printing" (A4 shrunk into a printer's 3 mm margins).
    var drawing = el("g", { class: "drawing" }, svg);
    var ink = el("g", { class: "ink", "stroke-width": 0.7 }, drawing);
    el("rect", { x: 20, y: 5, width: 185, height: 287, "stroke-width": 0.8 }, ink);
    el("rect", { x: 35, y: 40, width: 140, height: 90, rx: 10 }, ink);
    [[45, 50], [165, 50], [45, 120], [165, 120]].forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 5 }, ink); });
    el("rect", { x: 80, y: 77.5, width: 50, height: 15, rx: 7.5 }, ink);
    var dim = el("g", { class: "ink", "stroke-width": 0.35 }, drawing);
    el("line", { x1: 45, y1: 30, x2: 165, y2: 30 }, dim);
    el("line", { x1: 45, y1: 27, x2: 45, y2: 44 }, dim);
    el("line", { x1: 165, y1: 27, x2: 165, y2: 44 }, dim);
    var label = el("text", { x: 105, y: 28, "text-anchor": "middle", "font-size": 5, class: "ink-fill", stroke: "none", "font-style": "italic" }, drawing);
    label.textContent = "120";
    // The 100 mm control segment.
    el("line", { x1: 55, y1: 170, x2: 155, y2: 170, "stroke-width": 0.9 }, ink);
    for (var t = 0; t <= 10; t++) el("line", { x1: 55 + t * 10, y1: 170 - (t % 5 ? 2 : 4), x2: 55 + t * 10, y2: 170, "stroke-width": 0.35 }, ink);
    el("text", { x: 55, y: 177, "font-size": 4, class: "ink-fill", stroke: "none" }, drawing).textContent = "0";
    el("text", { x: 147, y: 177, "font-size": 4, class: "ink-fill", stroke: "none" }, drawing).textContent = "100 " + mm;
    // Title block.
    el("rect", { x: 20, y: 237, width: 185, height: 55, "stroke-width": 0.8 }, ink);
    el("line", { x1: 85, y1: 237, x2: 85, y2: 292 }, ink);
    el("line", { x1: 140, y1: 237, x2: 140, y2: 292 }, ink);
    el("text", { x: 89, y: 252, "font-size": 6, class: "ink-fill", stroke: "none", "font-weight": 700, "font-style": "italic" }, drawing).textContent = stage.getAttribute("data-title");
    el("text", { x: 144, y: 262, "font-size": 5, class: "ink-fill", stroke: "none", "font-style": "italic" }, drawing).textContent = "1:1";

    var measures = el("g", {}, svg);
    var scale = 1;
    var readout = stage.querySelector("[data-readout]");

    function setMode(full) {
      scale = full ? 1 : 0.971;
      drawing.setAttribute("transform", full ? "" : "translate(105 148.5) scale(0.971) translate(-105 -148.5)");
      stage.querySelectorAll("[data-mode]").forEach(function (b) {
        b.setAttribute("aria-pressed", String((b.getAttribute("data-mode") === "full") === full));
      });
      measures.innerHTML = "";
      autoMeasure();
    }

    function addMeasure(a, b) {
      var g = el("g", {}, measures);
      var line = el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "measure-line", "stroke-width": 0.9 }, g);
      var tag = el("g", { class: "measure-label" }, g);
      var box = el("rect", { rx: 1.5, "stroke-width": 0.4, height: 7 }, tag);
      var text = el("text", { "font-size": 4.6, "text-anchor": "middle" }, tag);
      function update(p) {
        line.setAttribute("x2", p.x); line.setAttribute("y2", p.y);
        var length = Math.hypot(p.x - a.x, p.y - a.y);
        text.textContent = fmt(length, 1) + " " + mm;
        var mx = (a.x + p.x) / 2, my = (a.y + p.y) / 2 - 5;
        text.setAttribute("x", mx); text.setAttribute("y", my + 1.6);
        var w = text.textContent.length * 2.5 + 4;
        box.setAttribute("x", mx - w / 2); box.setAttribute("y", my - 3.5); box.setAttribute("width", w);
        if (readout) readout.textContent = fmt(length, 1) + " " + mm;
      }
      update(b);
      return update;
    }

    // A measurement drawn by itself along the control segment, until the visitor measures.
    var autoTimer = null, interacted = false;
    function autoMeasure() {
      if (interacted) return;
      cancelAnimationFrame(autoTimer);
      var x0 = 105 + (55 - 105) * scale, x1 = 105 + (155 - 105) * scale, yy = 148.5 + (170 - 148.5) * scale - 6;
      var a = { x: x0, y: yy };
      var update = addMeasure(a, a);
      if (reduceMotion) { update({ x: x1, y: yy }); return; }
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var k = Math.min(1, (ts - start) / 1400);
        var e = 1 - Math.pow(1 - k, 3);
        update({ x: x0 + (x1 - x0) * e, y: yy });
        if (k < 1) autoTimer = requestAnimationFrame(step);
      }
      autoTimer = requestAnimationFrame(step);
    }

    function point(evt) {
      var p = svg.createSVGPoint();
      p.x = evt.clientX; p.y = evt.clientY;
      var q = p.matrixTransform(svg.getScreenCTM().inverse());
      return { x: Math.max(0, Math.min(210, q.x)), y: Math.max(0, Math.min(297, q.y)) };
    }
    var dragging = null, origin = null;
    svg.addEventListener("pointerdown", function (evt) {
      interacted = true;
      cancelAnimationFrame(autoTimer);
      svg.setPointerCapture(evt.pointerId);
      origin = point(evt);
      dragging = null;
    });
    svg.addEventListener("pointermove", function (evt) {
      if (!origin) return;
      var p = point(evt);
      if (evt.shiftKey || evt.ctrlKey) { // 15° steps, like the app
        var ang = Math.round(Math.atan2(p.y - origin.y, p.x - origin.x) / (Math.PI / 12)) * (Math.PI / 12);
        var len = Math.hypot(p.x - origin.x, p.y - origin.y);
        p = { x: origin.x + Math.cos(ang) * len, y: origin.y + Math.sin(ang) * len };
      }
      if (!dragging && Math.hypot(p.x - origin.x, p.y - origin.y) > 1.5) dragging = addMeasure(origin, p);
      else if (dragging) dragging(p);
    });
    svg.addEventListener("pointerup", function () {
      if (origin && !dragging) measures.innerHTML = ""; // a click clears, like the app
      origin = null; dragging = null;
    });

    stage.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        interacted = false;
        setMode(b.getAttribute("data-mode") === "full");
      });
    });

    // Start when the demo comes into view.
    if ("IntersectionObserver" in window) {
      var once = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { setMode(true); once.disconnect(); }
      }, { threshold: 0.4 });
      once.observe(stage);
    } else {
      setMode(true);
    }
  }

  // ------------------------------------------------------------ demo 2: size calibration
  var calDemo = document.getElementById("calibration-demo");
  if (calDemo) setupCalibration(calDemo);

  function setupCalibration(stage) {
    var mm = stage.getAttribute("data-mm");
    var svg = el("svg", { viewBox: "0 0 140 64", role: "img", "aria-label": stage.getAttribute("data-label") }, null);
    stage.insertBefore(svg, stage.firstChild);
    var x0 = 15;

    // A steel ruler: what the paper really measures.
    el("rect", { x: 5, y: 34, width: 130, height: 22, rx: 1.5, fill: "#d8dee8", stroke: "#9aa7b8", "stroke-width": 0.3 }, svg);
    var ticks = el("g", { stroke: "#2a3546" }, svg);
    for (var i = 0; i <= 115; i++) {
      el("line", { x1: x0 + i, y1: 34, x2: x0 + i, y2: 34 + (i % 10 === 0 ? 7 : i % 5 === 0 ? 5 : 3), "stroke-width": i % 10 === 0 ? 0.3 : 0.18 }, ticks);
      if (i % 10 === 0) el("text", { x: x0 + i, y: 47, "font-size": 3.2, "text-anchor": "middle", fill: "#2a3546", stroke: "none", "font-family": "Segoe UI, sans-serif" }, svg).textContent = i / 10;
    }
    el("text", { x: 125, y: 53, "font-size": 2.8, fill: "#5b6778", "font-family": "Segoe UI, sans-serif" }, svg).textContent = stage.getAttribute("data-cm");

    // The printed 100 mm bar on paper.
    el("rect", { x: 5, y: 6, width: 130, height: 26, rx: 1.5, class: "paper", "stroke-width": 0.3 }, svg);
    var bar = el("rect", { x: x0, y: 15, height: 6, style: "fill: var(--accent)", rx: 0.6 }, svg);
    var endLine = el("line", { y1: 12, y2: 56, style: "stroke: var(--accent)", "stroke-width": 0.35, "stroke-dasharray": "1 1" }, svg);
    el("line", { x1: x0, y1: 12, x2: x0, y2: 56, style: "stroke: var(--accent)", "stroke-width": 0.35, "stroke-dasharray": "1 1" }, svg);
    var target = el("line", { x1: x0 + 100, y1: 10, x2: x0 + 100, y2: 30, style: "stroke: var(--ok)", "stroke-width": 0.5 }, svg);
    var caption = el("text", { x: x0, y: 12, "font-size": 3.4, fill: "#1a2433", "font-family": "Segoe UI, sans-serif" }, svg);
    caption.textContent = stage.getAttribute("data-caption");

    var slider = stage.querySelector("[data-error]");
    var errorText = stage.querySelector("[data-error-text]");
    var before = stage.querySelector("[data-before]");
    var after = stage.querySelector("[data-after]");
    var button = stage.querySelector("[data-calibrate]");
    var steps = stage.querySelectorAll(".steps span");
    var calibrated = false, shown = 100, anim = null;

    function errorPercent() { return parseFloat(slider.value) / 10; }
    function printed() { return calibrated ? 100 : 100 * (1 + errorPercent() / 100); }
    function draw(length) {
      bar.setAttribute("width", length);
      endLine.setAttribute("x1", x0 + length); endLine.setAttribute("x2", x0 + length);
      target.setAttribute("opacity", Math.abs(length - 100) < 0.05 ? 0 : 1);
    }
    function animateTo(length) {
      cancelAnimationFrame(anim);
      if (reduceMotion) { shown = length; draw(length); return; }
      var from = shown, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var k = Math.min(1, (ts - start) / 900), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        shown = from + (length - from) * e;
        draw(shown);
        if (k < 1) anim = requestAnimationFrame(step);
      }
      anim = requestAnimationFrame(step);
    }
    function update() {
      var err = errorPercent();
      errorText.textContent = (err > 0 ? "+" : "") + fmt(err, 1) + " %";
      before.textContent = fmt(100 * (1 + err / 100), 1) + " " + mm;
      after.textContent = calibrated ? fmt(100, 1) + " " + mm : "—";
      button.textContent = calibrated ? button.getAttribute("data-reset") : button.getAttribute("data-run");
      steps.forEach(function (s, i) { s.classList.toggle("on", calibrated || i === 0); });
      animateTo(printed());
    }
    slider.addEventListener("input", function () { calibrated = false; update(); });
    button.addEventListener("click", function () {
      if (calibrated) { calibrated = false; update(); return; }
      // Measure, enter, print again: the three steps light up one after the other.
      steps.forEach(function (s, i) { setTimeout(function () { s.classList.add("on"); }, reduceMotion ? 0 : i * 350); });
      setTimeout(function () { calibrated = true; update(); }, reduceMotion ? 0 : 1050);
    });
    update();
  }
})();
