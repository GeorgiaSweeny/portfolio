// Hero pattern (WebGL): Georgia's name with her own Pattinator gallery patterns showing through the letters.
// A worker draws each pattern once with her generator code (src/js/hero-pattern-worker.js); a small
// hand-written shader then does everything live:
//  - stir: moving the cursor (or dragging a finger) pushes the pattern around like a brush through wet
//    paint, scaled by speed; it settles back to the clean pattern when you stop;
//  - change: the pattern moves on to the next one every few seconds, or on a click/tap. Georgia's pick
//    (14 Nov): melt + ink, the outgoing pattern melts into Perlin turbulence while the next one spreads in
//    crisp along noise contours, over 3s, each pattern held 4s, with a gentle stir (0.5) and a constant flow (1.2).
//  - flow: a constant, slow, gentle drift so the name is visibly alive before anyone touches it.
// Without WebGL or JS the name shows a still frame through CSS. Reduced motion: one pattern, still.
// Options can be changed at runtime through window.heroPattern.cfg (used by the hero lab page).
(() => {
  const h1 = document.querySelector(".hero-name");
  if (!h1 || !("Worker" in window)) return;
  const hero = h1.closest(".hero");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 13;                                         // patterns in the worker's PRESETS list
  const cfg = Object.assign({
    ambient: 1.2,                                       // constant slow flow (0 = still between changes)
    stir: true, stirStrength: 0.5,                      // brush-through-paint response to the pointer
    transition: "meltink",                              // "fade" | "melt" | "ink" | "meltink"
    interval: 4000,                                     // ms each pattern stays fully on screen before the next change; 0 = only on click/tap
    duration: 3000,                                     // ms per transition (shortened to match a quick tapping rhythm)
    drop: false,                                        // ink-drop: changes spread out from where you click
  }, window.HERO_CFG || {});
  const api = window.heroPattern = { cfg, next: () => advance(true) };

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
uniform float p, aspect, time, stir, melt, ink, fade, ambient, snap, drop;
uniform vec2 origin;
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
  if (snap > 0.5) d = vec2(0.0);                         // snapshot: the pattern itself, without stir/flow (they're added live)
  // melt: only the outgoing pattern melts, more and more as it gives way; the incoming one arrives crisp
  float pe = 1.0 - (1.0 - p) * (1.0 - p);              // ease-out: changes start the instant you click, then settle
  float m = melt * pe;
  vec2 md = (vec2(fbm(q * 1.6 + 11.0 + time * 0.05), fbm(q * 1.6 + 37.0 - time * 0.05)) - 0.5) * m * 0.22 / asp;
  vec3 a = texture2D(A, clamp(uv + d + md, 0.0, 1.0)).rgb, b = texture2D(B, clamp(uv + d, 0.0, 1.0)).rgb;
  // how much of the next pattern shows: ink spreads along noise contours, melt swaps at the peak, fade blends
  float n = fbm(q * 2.2 + 3.0);
  float wInk = smoothstep(n - 0.06, n + 0.06, 0.12 + pe * 0.72);   // n spans ~0.10–0.80: first spots at once, spread fills the change
  float wMelt = smoothstep(0.4, 0.6, p);
  // ink drop: the next pattern spreads out from where you clicked, with a ragged inky edge
  float r = distance(q, origin * asp) + (n - 0.4) * 0.35;
  float wDrop = smoothstep(r - 0.05, r + 0.05, pe * (aspect + 1.3));
  float w = drop > 0.5 ? wDrop : (ink > 0.5 ? wInk : (melt > 0.5 ? wMelt : p));
  if (snap > 0.5) { gl_FragColor = vec4(mix(a, b, w), 1.0); return; }
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
  for (const n of ["A", "B", "M", "V", "p", "aspect", "time", "stir", "melt", "ink", "fade", "ambient", "snap", "drop", "origin"]) U[n] = gl.getUniformLocation(prog, n);
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
  let genId = 0, patTex = [], size = null, words = [], worker = null, pw = 0, ph = 0, sharpWorkers = [], lineH = 0;

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

  // ---- turning a worker result into a texture: pixels directly, or Pattinator's SVG rasterised here ----
  function toSource(d, w, h) {
    if (!d.svg) return Promise.resolve(new ImageData(d.px, w, h));
    return new Promise((ok, fail) => {
      const img = new Image();
      const url = URL.createObjectURL(new Blob([d.svg], { type: "image/svg+xml" }));
      img.onload = () => {
        URL.revokeObjectURL(url);
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const g = c.getContext("2d");
        if (d.wrap) {                                   // repeat the 500-unit square at the pattern's scale
          const t = document.createElement("canvas"); t.width = t.height = Math.max(1, Math.round(500 * d.k));
          t.getContext("2d").drawImage(img, 0, 0, t.width, t.height);
          g.fillStyle = g.createPattern(t, "repeat"); g.fillRect(0, 0, w, h);
        } else g.drawImage(img, 0, 0, w, h);
        ok(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); fail(); };
      img.src = url;
    });
  }
  function upload(src, w, h) {
    gl.activeTexture(gl.TEXTURE0);                    // create on unit 0 so the mask on unit 2 is never replaced
    const t = tex();
    if (src instanceof ImageData) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src.data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    return t;
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
    // First pass: every pattern quickly at up to ~950px wide (stretched by the GPU); a second pass then
    // redraws them at the screen's own resolution (see sharpen()) so hard edges don't look pixelated.
    const k = Math.min(1, 950 / size.w);
    pw = Math.max(2, Math.round(size.w * k)); ph = Math.max(2, Math.round(size.h * k));
    lineH = words.length ? words[0].h : size.h;
    const ppu = (lineH * k) / 500;                     // Pattinator's 500px height = one line of the name
    patTex.forEach((t) => t && gl.deleteTexture(t)); patTex = [];
    if (worker) worker.terminate();
    sharpWorkers.forEach((w) => w.terminate()); sharpWorkers = [];
    let got = 0;
    worker = new Worker(window.HERO_WORKER || "/js/hero-pattern-worker.js");
    const order = reduce ? [cur] : [...Array(N).keys()].sort((a, b) => ((a - cur + N) % N) - ((b - cur + N) % N));
    const gen = genId = (genId || 0) + 1;
    worker.onmessage = (e) => {
      const d = e.data, i = d.i;
      toSource(d, pw, ph).then((src) => {
        if (gen !== genId) return;                     // resized since: stale
        if (patTex[i]) gl.deleteTexture(patTex[i]);
        patTex[i] = upload(src, pw, ph);
        if (i === cur) { h1.append(glc, outline); h1.classList.add("is-live"); frame(performance.now()); schedule(); wake(); }
      }).catch(() => {}).finally(() => {
        if (++got === order.length && gen === genId) { if (worker) worker.terminate(); worker = null; sharpen(); }
      });
    };
    worker.postMessage({ w: pw, h: ph, ppu, order, seed });
  }

  // Second pass: redraw each pattern at the screen's resolution (capped at 1800px wide to keep GPU memory
  // modest), shared between a few workers, the pattern on screen and the next ones first. Same seed and
  // same layout, so each swap is invisible apart from the sharper edges.
  function sharpen() {
    const ks = Math.min(size.dpr, 1800 / size.w);
    const sw = Math.round(size.w * ks), shh = Math.round(size.h * ks);
    if (sw <= pw * 1.15) return;                       // the first pass is already close to screen resolution
    const ppu = (lineH * ks) / 500;
    const order = reduce ? [cur] : [...Array(N).keys()].sort((a, b) => ((a - cur + N) % N) - ((b - cur + N) % N));
    const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1, order.length));
    for (let w = 0; w < n; w++) {
      const mine = order.filter((_, j) => j % n === w);
      const wk = new Worker(window.HERO_WORKER || "/js/hero-pattern-worker.js");
      let left = mine.length;
      const gen = genId;
      wk.onmessage = (e) => {
        const d = e.data, i = d.i;
        if (--left === 0) wk.terminate();
        toSource(d, sw, shh).then((src) => {
          if (gen !== genId) return;
          if (patTex[i]) gl.deleteTexture(patTex[i]);
          patTex[i] = upload(src, sw, shh);
          wake();
        }).catch(() => {});
      };
      wk.postMessage({ w: sw, h: shh, ppu, order: mine, seed });
      sharpWorkers.push(wk);
    }
  }

  // ---- changing pattern ---------------------------------------------------------
  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    if (!reduce && cfg.interval > 0) timer = setTimeout(advance, cfg.interval);
  }
  // Every click starts the next change at once. Mid-change, what's on screen is captured into a texture
  // (snapshot) and becomes the starting point, so rapid clicks chain without waiting or skipping. The
  // change's length follows the tapping rhythm: about 90% of the gap between clicks (0.5–3s).
  let dur = 0, aTex = null, lastClick = 0, org = [0.5, 0.5];
  const snaps = [null, null]; let snapFb = null, snapW = 0, snapH = 0, snapI = 0;
  function snapshot() {
    const w = glc.width, h = glc.height;
    if (!snapFb || snapW !== w || snapH !== h) {
      snaps.forEach((t) => t && gl.deleteTexture(t));
      for (let k = 0; k < 2; k++) {
        gl.activeTexture(gl.TEXTURE0); snaps[k] = tex();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      snapFb = snapFb || gl.createFramebuffer(); snapW = w; snapH = h;
    }
    snapI = 1 - snapI;                                   // ping-pong: never draw into the texture being read
    gl.bindFramebuffer(gl.FRAMEBUFFER, snapFb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, snaps[snapI], 0);
    draw(performance.now(), true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return snaps[snapI];
  }
  function advance(byClick, at) {
    if (reduce) return;
    const now = performance.now();
    if (nxt !== -1) {                                    // mid-change: start from exactly what's showing
      aTex = snapshot(); cur = nxt; nxt = -1;
    } else if (!byClick) aTex = null;
    let n = (cur + 1) % N, tries = 0;
    while (!patTex[n] && tries++ < N) n = (n + 1) % N;  // skip any not drawn yet
    if (!patTex[n] || (n === cur && !aTex)) return schedule();
    clearTimeout(timer);
    let d = cfg.transition === "fade" ? Math.min(900, cfg.duration) : cfg.duration;
    if (byClick) {
      const gap = now - lastClick; lastClick = now;
      if (gap < 3200) d = Math.max(500, Math.min(d, gap * 0.9));
    }
    org = at || [Math.random(), Math.random()];
    nxt = n; p = 0; tStart = now; dur = d;
    wake();
  }

  // ---- drawing ---------------------------------------------------------------------
  let running = false, visible = true;
  function frame(now) {
    now = performance.now();
    if (nxt !== -1) {
      p = Math.min(1, Math.max(0, (now - tStart) / dur));
      if (p >= 1) { cur = nxt; nxt = -1; p = 0; aTex = null; schedule(); }
    }
    uploadVel();
    draw(now, false);
  }
  function draw(now, snapping) {
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, aTex || patTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, nxt === -1 ? (aTex || patTex[cur]) : patTex[nxt]);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, maskTex);
    const tr = cfg.transition;
    gl.uniform1f(U.p, nxt === -1 ? 0 : p);
    gl.uniform1f(U.aspect, size.w / size.h);
    gl.uniform1f(U.time, now / 1000);
    gl.uniform1f(U.stir, cfg.stir && !reduce ? 1 : 0);
    gl.uniform1f(U.ambient, reduce ? 0 : cfg.ambient);
    gl.uniform1f(U.melt, tr === "melt" || tr === "meltink" ? 1 : 0);
    gl.uniform1f(U.ink, tr === "ink" || tr === "meltink" ? 1 : 0);
    gl.uniform1f(U.drop, cfg.drop ? 1 : 0);
    gl.uniform2f(U.origin, org[0], 1 - org[1]);
    gl.uniform1f(U.snap, snapping ? 1 : 0);
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
      if (downAt && !e.target.closest("a, button") && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 10) {
        const q = at(e); advance(true, [Math.min(1, Math.max(0, q.x)), Math.min(1, Math.max(0, q.y))]);
      }
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
