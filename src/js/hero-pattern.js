// Hero pattern: Georgia's name with a live Pattinator pattern showing through the letters.
// A worker draws frames along the random → rule-based spectrum with her own generator code;
// this script blends between them as the cursor (or a finger) moves, and drifts on its own
// when nobody is touching it. Without JS, or before the first frame, the name shows a still
// frame through CSS (background-clip: text). Reduced motion: one frame, no movement.
(() => {
  const h1 = document.querySelector(".hero-name");
  if (!h1 || !("Worker" in window) || !window.CanvasRenderingContext2D) return;
  const hero = h1.closest(".hero");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FRAMES = reduce ? [0.62] : Array.from({ length: 17 }, (_, i) => i / 16);
  // Draw the middle first, then work outwards, so the first frames are the ones you see first.
  const order = [...FRAMES].sort((a, b) => Math.abs(a - 0.62) - Math.abs(b - 0.62));

  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  let worker = null, frames = new Map(), size = null, words = [], mask = null;
  let t = 0.62, target = 0.62, phase = Math.asin(0.12 / 0.45), userUntil = 0, running = false, visible = true, last = 0;

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
    // unit: how big the pattern is drawn. Scale it with the name so phones and desktops show a similar amount.
    const unit = Math.max(55, Math.min(100, size.h / 3.2)) * k;
    worker.onmessage = (e) => {
      const { t: ft, px } = e.data;
      const c = document.createElement("canvas");
      c.width = pw; c.height = ph;
      c.getContext("2d").putImageData(new ImageData(px, pw, ph), 0, 0);
      frames.set(ft, c);
      if (frames.size === 1) { h1.append(canvas); h1.classList.add("is-live"); draw(); }
      if (!reduce) wake();
    };
    worker.postMessage({ w: pw, h: ph, unit, order });
  }

  function draw() {
    if (!size || !frames.size) return;
    const keys = [...frames.keys()].sort((a, b) => a - b);
    let a = keys[0], b = keys[keys.length - 1];
    for (const k of keys) { if (k <= t) a = k; if (k >= t) { b = k; break; } }
    const f = b === a ? 0 : (t - a) / (b - a);
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
