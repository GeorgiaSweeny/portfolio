// Hero pattern: Georgia's name with her own Pattinator gallery patterns showing through the letters.
// A worker draws one frame per pattern (eight, ordered random → rule-based) with her generator code;
// this script blends from one to the next as the cursor (or a finger) moves across, and drifts on
// its own when nobody is touching it. Every visit starts at a random point with a new seed.
// Without JS, or before the first frame, the name shows a still frame through CSS
// (background-clip: text). Reduced motion: one pattern, no movement.
(() => {
  const h1 = document.querySelector(".hero-name");
  if (!h1 || !("Worker" in window) || !window.CanvasRenderingContext2D) return;
  const hero = h1.closest(".hero");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 8;                                         // patterns in the worker's PRESETS list
  const startT = Math.random();                         // where this visit begins on the spectrum
  const seed = 1 + Math.floor(Math.random() * 1e6);    // a fresh layout of the same settings
  const first = Math.round(startT * (N - 1));
  // Draw the starting pattern first, then work outwards, so the first frames are the ones you see first.
  const order = reduce ? [first] : [...Array(N).keys()].sort((a, b) => Math.abs(a - first) - Math.abs(b - first));

  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  let worker = null, frames = new Map(), size = null, words = [], mask = null, edge = null;
  let t = reduce ? first / (N - 1) : startT, target = t, userUntil = 0, running = false, visible = true, last = 0;
  let phase = Math.asin(Math.max(-1, Math.min(1, (t - 0.5) / 0.45)));

  function measure() {
    const r = h1.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cs = getComputedStyle(h1);
    const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    words = [...h1.querySelectorAll(".w")].map((s) => {
      const b = s.getBoundingClientRect();
      return { text: s.textContent, x: b.left - r.left, y: b.top - r.top, h: b.height };
    });
    return { w: r.width, h: r.height, dpr, font, ls: cs.letterSpacing };
  }

  function start() {
    size = measure();
    canvas.width = Math.round(size.w * size.dpr);
    canvas.height = Math.round(size.h * size.dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    makeMask();
    // Pattern frames are drawn at up to ~950px wide and scaled up: the pattern is soft enough not to need more.
    const k = Math.min(1, 950 / size.w);
    const pw = Math.max(2, Math.round(size.w * k)), ph = Math.max(2, Math.round(size.h * k));
    frames = new Map();
    if (worker) worker.terminate();
    worker = new Worker("/js/hero-pattern-worker.js");
    // Pattinator's 500px canvas height maps onto one line of the name, as in the comparisons Georgia picked from,
    // so phones and desktops show the same amount of pattern per letter.
    const lineH = words.length ? words[0].h : size.h;
    const ppu = (lineH * k) / 500;
    worker.onmessage = (e) => {
      const { i: ft, px } = e.data;
      const c = document.createElement("canvas");
      c.width = pw; c.height = ph;
      c.getContext("2d").putImageData(new ImageData(px, pw, ph), 0, 0);
      frames.set(ft, c);
      if (frames.size === 1) { h1.append(canvas); h1.classList.add("is-live"); draw(); }
      if (!reduce) wake();
    };
    worker.postMessage({ w: pw, h: ph, ppu, order, seed });
  }

  function draw() {
    if (!size || !frames.size) return;
    const pos = t * (N - 1);                            // 0 … 8 along the patterns
    const keys = [...frames.keys()].sort((a, b) => a - b);
    let a = keys[0], b = keys[keys.length - 1];
    for (const k of keys) { if (k <= pos) a = k; if (k >= pos) { b = k; break; } }
    if (pos < keys[0]) b = a; if (pos > keys[keys.length - 1]) a = b;
    const f = b === a ? 0 : (pos - a) / (b - a);
    const W = canvas.width, H = canvas.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(frames.get(a), 0, 0, W, H);
    if (f > 0.001) { ctx.globalAlpha = f; ctx.drawImage(frames.get(b), 0, 0, W, H); ctx.globalAlpha = 1; }
    // Keep the pattern only inside the letters.
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(edge, 0, 0);                          // a faint light outline keeps dark patterns legible
  }

  // The letters, drawn once per size, in the same place as the real (transparent) text.
  function makeMask() {
    mask = document.createElement("canvas");
    mask.width = canvas.width; mask.height = canvas.height;
    const m = mask.getContext("2d");
    m.scale(size.dpr, size.dpr);
    m.font = size.font;
    if ("letterSpacing" in m) m.letterSpacing = size.ls;
    m.textBaseline = "alphabetic";
    m.fillStyle = "#fff";
    for (const w of words) {
      const mt = m.measureText(w.text);
      const asc = mt.fontBoundingBoxAscent ?? mt.actualBoundingBoxAscent;
      const desc = mt.fontBoundingBoxDescent ?? mt.actualBoundingBoxDescent;
      m.fillText(w.text, w.x, w.y + (w.h - (asc + desc)) / 2 + asc);
    }
    edge = document.createElement("canvas");
    edge.width = canvas.width; edge.height = canvas.height;
    const g = edge.getContext("2d");
    g.scale(size.dpr, size.dpr);
    g.font = size.font;
    if ("letterSpacing" in g) g.letterSpacing = size.ls;
    g.textBaseline = "alphabetic";
    g.strokeStyle = "rgba(243, 239, 228, 0.55)";
    g.lineWidth = 1.5;
    g.lineJoin = "round";
    for (const w of words) {
      const mt = g.measureText(w.text);
      const asc = mt.fontBoundingBoxAscent ?? mt.actualBoundingBoxAscent;
      const desc = mt.fontBoundingBoxDescent ?? mt.actualBoundingBoxDescent;
      g.strokeText(w.text, w.x, w.y + (w.h - (asc + desc)) / 2 + asc);
    }
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(64, now - (last || now)); last = now;
    if (now > userUntil) {
      phase += dt / 9000;                        // a slow drift, one sweep every ~1 minute
      target = 0.5 + 0.45 * Math.sin(phase);
    }
    t += (target - t) * Math.min(1, dt / 220);
    draw();
    if (!visible) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function wake() { if (!running && visible && !reduce) { running = true; last = 0; requestAnimationFrame(tick); } }

  function steer(clientX, el) {
    const r = el.getBoundingClientRect();
    target = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    // keep the drift continuous from wherever the visitor leaves it
    phase = Math.asin(Math.max(-1, Math.min(1, (target - 0.5) / 0.45)));
    userUntil = performance.now() + 2500;
    wake();
  }
  if (!reduce) {
    hero.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") steer(e.clientX, hero); });
    h1.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse" && e.buttons) steer(e.clientX, h1); });
    h1.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") steer(e.clientX, h1); });
    h1.style.touchAction = "pan-y";
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(hero);
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) wake(); });
  }

  let rw = 0;
  addEventListener("resize", () => {
    clearTimeout(rw);
    rw = setTimeout(() => {
      const r = h1.getBoundingClientRect();
      if (!size || Math.abs(r.width - size.w) > 2 || Math.abs(r.height - size.h) > 2) start();
    }, 250);
  });

  // Start once the page has painted and the name's font is ready.
  const go = () => document.fonts.load(`${getComputedStyle(h1).fontWeight} 100px "Dela Gothic One"`).then(start, start);
  if (document.readyState === "complete") setTimeout(go, 50); else addEventListener("load", () => setTimeout(go, 50));
})();
