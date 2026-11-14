// Hero pattern (WebGL): Georgia's name with her own Pattinator gallery patterns showing through the letters.
// A worker draws each pattern once with her generator code (src/js/hero-pattern-worker.js); a small
// hand-written shader then does everything live:
//  - stir: moving the cursor (or dragging a finger) pushes the pattern around like a brush through wet
//    paint, scaled by speed; it settles back to the clean pattern when you stop;
//  - change: the pattern moves on to the next one every few seconds, or on a click/tap. Georgia's pick
//    (14 Nov): melt + ink, the outgoing pattern melts into Perlin turbulence while the next one spreads in
//    crisp along noise contours, over 3s, every 5s, with a gentle stir (0.5) and a constant flow (1.2).
//  - flow: a constant, slow, gentle drift so the name is visibly alive before anyone touches it.
// Without WebGL or JS the name shows a still frame through CSS. Reduced motion: one pattern, still.
// Options can be changed at runtime through window.heroPattern.cfg (used by the hero lab page).
(() => {
  const h1 = document.querySelector(".hero-name");
  if (!h1 || !("Worker" in window)) return;
  const hero = h1.closest(".hero");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 10;                                         // patterns in the worker's PRESETS list
  const cfg = Object.assign({
    ambient: 1.2,                                       // constant slow flow (0 = still between changes)
    stir: true, stirStrength: 0.5,                      // brush-through-paint response to the pointer
    transition: "meltink",                              // "fade" | "melt" | "ink" | "meltink"
    interval: 5000,                                     // ms between automatic changes; 0 = only on click/tap
    duration: 3000,                                     // ms per transition
  }, window.HERO_CFG || {});
  const api = window.heroPattern = { cfg, next: () => advance() };

  const seed = 1 + Math.floor(Math.random() * 1e6);
  let cur = Math.floor(Math.random() * N), nxt = -1, p = 0, tStart = 0;

  const glc = document.createElement("canvas");
  glc.className = "hero-canvas";
  glc.setAttribute("aria-hidden", "true");
  const gl = glc.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;                                      // the CSS still frame stays
  const outline = document.createElement("canvas");
  outline.className = "hero-canvas";
  outline.setAttribute("aria-hidden", "true");

  // ---- shader ---------------------------------------------------------------
  const VS = "attribute vec2 a; varying vec2 uv; void main(){ uv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }";
  const FS = `precision mediump float;
varying vec2 uv;
uniform sampler2D A, B, M, V;
uniform float p, aspect, time, stir, melt, ink, fade, ambient;
float h(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 q){ vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 q){ float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++){ s += a * vn(q); q *= 2.03; a *= 0.5; } return s; }
void main(){
  vec2 asp = vec2(aspect, 1.0);
  vec2 q = uv * asp;
  // stir: the pointer's velocity field, plus turbulence that grows with it
  vec2 vel = (texture2D(V, uv).rg - 0.5) * 2.0;
  float e = length(vel);
  vec2 curl = vec2(fbm(q * 3.0 + vec2(0.0, time * 0.15)), fbm(q * 3.0 + vec2(5.2, 1.3) - time * 0.15)) - 0.5;
  vec2 d = -stir * (vel * 0.12 + curl * e * 0.22) / asp;   // sample behind the motion, so paint moves with the pointer
  // ambient: a constant, slow, gentle flow so the name is visibly alive even when nobody touches it
  // local ripples (finer, faster) layered on a slow wide drift, so parts of each letter move against each other
  vec2 af = ((vec2(fbm(q * 2.6 + vec2(time * 0.24, -time * 0.09)), fbm(q * 2.6 + vec2(7.7 - time * 0.11, time * 0.2))) - 0.5) * 0.05
           + (vec2(fbm(q * 0.9 + vec2(time * 0.1, 0.0)), fbm(q * 0.9 + vec2(3.1, -time * 0.09))) - 0.5) * 0.035) * ambient / asp;
  d += af;
  // melt: only the outgoing pattern melts, more and more as it gives way; the incoming one arrives crisp
  float m = melt * smoothstep(0.0, 1.0, p);
  vec2 md = (vec2(fbm(q * 1.6 + 11.0 + time * 0.05), fbm(q * 1.6 + 37.0 - time * 0.05)) - 0.5) * m * 0.22 / asp;
  vec3 a = texture2D(A, clamp(uv + d + md, 0.0, 1.0)).rgb, b = texture2D(B, clamp(uv + d, 0.0, 1.0)).rgb;
  // how much of the next pattern shows: ink spreads along noise contours, melt swaps at the peak, fade blends
  float n = fbm(q * 2.2 + 3.0);
  float wInk = smoothstep(n - 0.06, n + 0.06, p * 1.25 - 0.12);
  float wMelt = smoothstep(0.4, 0.6, p);
  float w = ink > 0.5 ? wInk : (melt > 0.5 ? wMelt : p);
  float alpha = texture2D(M, uv).a;
  gl_FragColor = vec4(mix(a, b, w) * alpha, alpha);
}`;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ["A", "B", "M", "V", "p", "aspect", "time", "stir", "melt", "ink", "fade", "ambient"]) U[n] = gl.getUniformLocation(prog, n);
  gl.uniform1i(U.A, 0); gl.uniform1i(U.B, 1); gl.uniform1i(U.M, 2); gl.uniform1i(U.V, 3);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  function tex() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  gl.activeTexture(gl.TEXTURE2); const maskTex = tex();
  gl.activeTexture(gl.TEXTURE3); const velTex = tex();
  let patTex = [], size = null, words = [], worker = null, pw = 0, ph = 0;

  // ---- stir field: a coarse grid of velocities, deposited by the pointer and fading each frame ----
  let GW = 96, GH = 32, vx, vy, velBytes, energy = 0;
  function resetGrid() {
    GH = Math.max(12, Math.min(64, Math.round(GW * size.h / size.w)));
    vx = new Float32Array(GW * GH); vy = new Float32Array(GW * GH); velBytes = new Uint8Array(GW * GH * 4);
  }
  function deposit(x, y, dx, dy) {                     // x, y in 0..1 (top-left origin), dx, dy in name-widths
    const cx = x * GW, cy = y * GH, r = 6, k = 22 * cfg.stirStrength;
    for (let j = Math.max(0, Math.floor(cy - r)); j < Math.min(GH, Math.ceil(cy + r)); j++)
      for (let i = Math.max(0, Math.floor(cx - r * 1.2)); i < Math.min(GW, Math.ceil(cx + r * 1.2)); i++) {
        const f = Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / (r * r * 0.5));
        vx[j * GW + i] += dx * k * f; vy[j * GW + i] += dy * k * f * (size.w / size.h);
      }
    energy = 1;
  }
  function uploadVel() {
    let e = 0;
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      const s = j * GW + i, o = ((GH - 1 - j) * GW + i) * 4;       // flip rows: the shader's uv starts bottom-left
      vx[s] *= 0.94; vy[s] *= 0.94;
      const a = Math.max(-1, Math.min(1, vx[s])), b = Math.max(-1, Math.min(1, -vy[s]));
      velBytes[o] = (a * 0.5 + 0.5) * 255; velBytes[o + 1] = (b * 0.5 + 0.5) * 255; velBytes[o + 3] = 255;
      e = Math.max(e, Math.abs(a), Math.abs(b));
    }
    energy = e;
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, velTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, velBytes);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  // ---- layout, letters, outline ------------------------------------------------
  function measure() {
    const r = h1.getBoundingClientRect(), cs = getComputedStyle(h1);
    words = [...h1.querySelectorAll(".w")].map((s) => {
      const b = s.getBoundingClientRect();
      return { text: s.textContent, x: b.left - r.left, y: b.top - r.top, h: b.height };
    });
    return { w: r.width, h: r.height, dpr: Math.min(2, window.devicePixelRatio || 1), font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, ls: cs.letterSpacing };
  }
  function letters(fill) {
    const c = document.createElement("canvas");
    c.width = Math.round(size.w * size.dpr); c.height = Math.round(size.h * size.dpr);
    const g = c.getContext("2d");
    g.scale(size.dpr, size.dpr); g.font = size.font;
    if ("letterSpacing" in g) g.letterSpacing = size.ls;
    g.textBaseline = "alphabetic"; g.lineJoin = "round";
    if (fill) g.fillStyle = "#fff"; else { g.strokeStyle = "rgba(243, 239, 228, 0.55)"; g.lineWidth = 1.5; }
    for (const w of words) {
      const mt = g.measureText(w.text);
      const asc = mt.fontBoundingBoxAscent ?? mt.actualBoundingBoxAscent, desc = mt.fontBoundingBoxDescent ?? mt.actualBoundingBoxDescent;
      const y = w.y + (w.h - (asc + desc)) / 2 + asc;
      fill ? g.fillText(w.text, w.x, y) : g.strokeText(w.text, w.x, y);
    }
    return c;
  }

  function start() {
    size = measure();
    for (const c of [glc, outline]) { c.style.width = `${size.w}px`; c.style.height = `${size.h}px`; }
    glc.width = Math.round(size.w * size.dpr); glc.height = Math.round(size.h * size.dpr);
    gl.viewport(0, 0, glc.width, glc.height);
    const o = letters(false); outline.width = o.width; outline.height = o.height; outline.getContext("2d").drawImage(o, 0, 0);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, letters(true));
    resetGrid();
    // patterns are drawn at up to ~950px wide and scaled up by the GPU
    const k = Math.min(1, 950 / size.w);
    pw = Math.max(2, Math.round(size.w * k)); ph = Math.max(2, Math.round(size.h * k));
    const lineH = words.length ? words[0].h : size.h;
    const ppu = (lineH * k) / 500;                     // Pattinator's 500px height = one line of the name
    patTex.forEach((t) => t && gl.deleteTexture(t)); patTex = [];
    if (worker) worker.terminate();
    worker = new Worker(window.HERO_WORKER || "/js/hero-pattern-worker.js");
    const order = reduce ? [cur] : [...Array(N).keys()].sort((a, b) => ((a - cur + N) % N) - ((b - cur + N) % N));
    worker.onmessage = (e) => {
      const { i, px } = e.data;
      gl.activeTexture(gl.TEXTURE0);                  // create on unit 0 so the mask on unit 2 is never replaced
      const t = tex();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pw, ph, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
      patTex[i] = t;
      if (i === cur) { h1.append(glc, outline); h1.classList.add("is-live"); frame(performance.now()); schedule(); wake(); }
    };
    worker.postMessage({ w: pw, h: ph, ppu, order, seed });
  }

  // ---- changing pattern ---------------------------------------------------------
  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    if (!reduce && cfg.interval > 0) timer = setTimeout(advance, cfg.interval);
  }
  function advance() {
    if (reduce) return;
    if (nxt !== -1) { cur = nxt; nxt = -1; p = 0; }     // mid-change: finish it at once, then start the next
    let n = (cur + 1) % N, tries = 0;
    while (!patTex[n] && tries++ < N) n = (n + 1) % N;  // skip any not drawn yet
    if (!patTex[n] || n === cur) return schedule();
    nxt = n; p = 0; tStart = performance.now(); wake();
  }

  // ---- drawing ---------------------------------------------------------------------
  let running = false, visible = true;
  function frame(now) {
    if (nxt !== -1) {
      p = Math.min(1, (now - tStart) / (cfg.transition === "fade" ? Math.min(900, cfg.duration) : cfg.duration));
      if (p >= 1) { cur = nxt; nxt = -1; p = 0; schedule(); }
    }
    uploadVel();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, patTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, patTex[nxt === -1 ? cur : nxt]);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, maskTex);
    const tr = cfg.transition;
    gl.uniform1f(U.p, nxt === -1 ? 0 : p);
    gl.uniform1f(U.aspect, size.w / size.h);
    gl.uniform1f(U.time, now / 1000);
    gl.uniform1f(U.stir, cfg.stir && !reduce ? 1 : 0);
    gl.uniform1f(U.ambient, reduce ? 0 : cfg.ambient);
    gl.uniform1f(U.melt, tr === "melt" || tr === "meltink" ? 1 : 0);
    gl.uniform1f(U.ink, tr === "ink" || tr === "meltink" ? 1 : 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  let skip = false;
  function tick(now) {
    if (!running) return;
    const busy = nxt !== -1 || energy >= 0.004;
    if (busy || !(skip = !skip)) frame(now);           // only the slow flow moving: draw every other frame
    if (!visible || (!busy && !(cfg.ambient > 0 && !reduce))) { running = false; return; }   // idle: nothing moving
    requestAnimationFrame(tick);
  }
  function wake() { if (!running && visible && size) { running = true; requestAnimationFrame(tick); } }

  // ---- pointer ------------------------------------------------------------------------
  if (!reduce) {
    let last = null, downAt = null;
    const at = (e) => { const r = h1.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t: e.timeStamp }; };
    hero.addEventListener("pointermove", (e) => {
      if (!size || !cfg.stir) return;
      if (e.pointerType !== "mouse" && !e.buttons) return;
      const q = at(e);
      if (last && q.t > last.t) {
        const dt = Math.max(8, q.t - last.t) / 16;      // per ~frame
        if (q.x > -0.1 && q.x < 1.1 && q.y > -0.2 && q.y < 1.2) deposit(q.x, q.y, (q.x - last.x) / dt, (q.y - last.y) / dt);
        wake();
      }
      last = q;
    });
    hero.addEventListener("pointerleave", () => { last = null; });
    hero.addEventListener("pointerdown", (e) => { if (e.target.closest("a, button")) return; downAt = { x: e.clientX, y: e.clientY }; last = at(e); });
    hero.addEventListener("pointerup", (e) => {   // a click or tap (not a drag) anywhere in the hero brings in the next pattern
      if (downAt && !e.target.closest("a, button") && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 10) advance();
      downAt = null;
    });
    h1.style.touchAction = "pan-y";
    hero.style.cursor = "pointer";
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(hero);
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) wake(); else clearTimeout(timer); if (visible) schedule(); });
  }

  let rw = 0;
  addEventListener("resize", () => {
    clearTimeout(rw);
    rw = setTimeout(() => { const r = h1.getBoundingClientRect(); if (!size || Math.abs(r.width - size.w) > 2 || Math.abs(r.height - size.h) > 2) start(); }, 250);
  });
  api.restartTimer = schedule;
  api.wake = wake;
  const go = () => document.fonts.load(`${getComputedStyle(h1).fontWeight} 100px "Dela Gothic One"`).then(start, start);
  if (document.readyState === "complete") setTimeout(go, 50); else addEventListener("load", () => setTimeout(go, 50));
})();
