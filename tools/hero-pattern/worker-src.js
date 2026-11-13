// Hero pattern worker: draws frames along Pattinator's random → rule-based spectrum.
// Source for src/js/hero-pattern-worker.js. Rebuild with `npm run build:hero` after editing.
// The generators in ./pattinator/ are copied unmodified from
// GeorgiaSweeny/algorithmic-pattern-explorer (src/, commit 201833d).
import { islamic } from "./pattinator/generators/islamic.js";
import { noise } from "./pattinator/generators/noise.js";

const ISLAMIC = { tileShape: "hexagon", segments: 8, frequency: 3, lineWidth: 0.07, rotation: 0, tones: "3", scale: 0.42 };
const NOISE = { mode: "standard", octaves: 3, lacunarity: 2, persistence: 0.5, seed: 1337 };

// Spectrum colours (light, mid, dark), echoing the banner: monochrome marbling at the
// random end, warming through navy and plum, to teal geometry at the rule-based end.
// Georgia may retune these; keep each stop's light tone well clear of the deep-teal page.
const STOPS = [
  { t: 0.0,  c: ["#f7f4ec", "#6f7774", "#141c1b"] },
  { t: 0.35, c: ["#ffd978", "#4f86b8", "#1d3c63"] },
  { t: 0.7,  c: ["#f7a47e", "#d0477a", "#6b1d57"] },
  { t: 1.0,  c: ["#eef1d2", "#a8bd77", "#2c8a80"] },
];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const STOP_RGB = STOPS.map((s) => ({ t: s.t, c: s.c.map(hex) }));

function paletteAt(t) {
  let i = 0;
  while (i < STOP_RGB.length - 2 && t > STOP_RGB[i + 1].t) i++;
  const a = STOP_RGB[i], b = STOP_RGB[i + 1];
  const f = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  return a.c.map((ca, k) => ca.map((v, j) => v + (b.c[k][j] - v) * f));
}

self.onmessage = (e) => {
  const { w, h, unit, order } = e.data; // unit = pattern scale in canvas pixels per 100 design px
  const k = unit / 100;
  const isl = { ...ISLAMIC, tileSize: 120 * k };
  const noi = { ...NOISE, scale: 0.006 / k };
  // The noise fields don't depend on the spectrum position, so work them out once.
  const n1 = new Float32Array(w * h), n2 = new Float32Array(w * h);
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
    n1[i] = noise(x, y, noi);
    n2[i] = noise(x + 913 * k, y + 377 * k, noi);
  }
  for (const t of order) {
    const pal = paletteAt(t);
    const amp = (1 - t) * (1 - t) * 260 * k;
    const px = new Uint8ClampedArray(w * h * 4);
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      const r = islamic(x + n1[i] * amp, y + n2[i] * amp, isl);
      const v = t * r + (1 - t) * (0.6 * n1[i] + 0.4 * r);
      // v: +1 light … -1 dark, across the three tones
      const s = Math.min(2, Math.max(0, (1 - v)));
      const lo = s < 1 ? 0 : 1, f = s - lo;
      const A = pal[lo], B = pal[lo + 1], o = i * 4;
      px[o] = A[0] + (B[0] - A[0]) * f;
      px[o + 1] = A[1] + (B[1] - A[1]) * f;
      px[o + 2] = A[2] + (B[2] - A[2]) * f;
      px[o + 3] = 255;
    }
    postMessage({ t, px }, [px.buffer]);
  }
};
