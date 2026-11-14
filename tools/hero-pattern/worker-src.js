// Hero pattern worker: draws Georgia's own Pattinator gallery patterns for the hero, one frame
// per pattern, ordered from random to rule-based. Source for src/js/hero-pattern-worker.js:
// rebuild with `npm run build:hero` after editing.
//
// The generators in ./pattinator/ are copied unmodified from GeorgiaSweeny/algorithmic-pattern-explorer
// (src/, commit 201833d). Settings and colours are her gallery presets (src/app/src/gallery/
// galleryPatterns.js) except where marked. Pattinator draws on a fixed 500 × 500 canvas; here the
// canvas is widened to the hero's shape and each pattern simply extends across it:
//  - "cells" patterns (Voronoi) get a wider canvas and proportionally more cells, so cell size stays;
//  - "wrap" patterns (the recursive grid) repeat their 500-unit square;
//  - Perlin-Sierpinski already samples its first warp across the whole canvas, so it extends as is.
import { CANVAS } from "./pattinator/config.js";
import { noise } from "./pattinator/generators/noise.js";
import { recursiveNoise } from "./pattinator/generators/recursiveNoise.js";
import { voronoi } from "./pattinator/generators/voronoi.js";
import { voronoiIslamicV2 } from "./pattinator/generators/voronoiIslamicV2.js";
import { escher } from "./pattinator/generators/escher.js";
import { recursive } from "./pattinator/generators/recursive.js";
import { islamic } from "./pattinator/generators/islamic.js";
// Vector renderers: Pattinator draws these pattern types as SVG (nativeFormat "vector"), so the hero uses
// the same code for them, for identical shapes and crisp edges. The main thread rasterises the SVG.
import { islamicSvg } from "./pattinator/generators/svg/islamic-svg.js";
import { voronoiSvg } from "./pattinator/generators/svg/voronoi-svg.js";
import { escherSvg } from "./pattinator/generators/svg/escher-svg.js";
import { recursiveSvg } from "./pattinator/generators/svg/recursive-svg.js";

const INK = { amplitude1: 0.445, scale1: 0.00639, octaves1: 1, amplitude2: 0.3, scale2: 0.00982, octaves2: 1, amplitude3: 0.18, scale3: 0.01031, octaves3: 7, amplitude4: 0.185, scale4: 0.00443, octaves4: 2, depth: 4 };

// In spectrum order, random → rule-based. `size`: how much bigger than Pattinator's own pixels to draw.
export const PRESETS = [
  { name: "Cotton Candy Ridge", gen: noise, size: 1.5, colours: ["#df84e6", "#f50000"],
    ridge: 0.7, // ridge lines a tad more distinct (Georgia, 14 Nov)
    params: { mode: "ridge", scale: 0.00394, octaves: 2, lacunarity: 3, persistence: 0.716 } }, // Georgia's re-export, 14 Nov
  // Georgia's export ridge-noise (3), 14 Nov
  { name: "Blue Ridge", gen: noise, size: 1.5, colours: ["#8accf5", "#1f00bd"],
    params: { mode: "ridge", scale: 0.00541, octaves: 3, lacunarity: 4, persistence: 0.9 } },
  { name: "Ink Bloom", gen: recursiveNoise, size: 1.5, colours: ["#121111", "#fffefa"], params: INK },
  // Ink Bloom's settings in the red and purple of the banner strip (colours sampled from the banner).
  { name: "Red and purple bloom", gen: recursiveNoise, size: 1.5, colours: ["#8e0f6b", "#e8442f"], params: INK },
  { name: "Voronoi Patchwork", gen: voronoi, svg: voronoiSvg, size: 1.5, kind: "cells", colours: ["#e7f5e0", "#d8c2e0", "#5fafbf", "#8a3d3d", "#ce721c"],
    params: { numCells: 51.5, tones: "5" } },
  { name: "Golden Shards", gen: voronoiIslamicV2, size: 2.5, kind: "cells", colours: ["#fff700", "#e5c10b", "#862331"],
    params: { numCells: 60.5, tones: "3", tileSize: 196.8, scale: 0.3876, segments: 7, frequency: 4, lineWidth: 0.0198, rotation: 0, randomRotation: 0 } },
  { name: "Gilded Cluster", gen: voronoiIslamicV2, size: 1.5, kind: "cells", colours: ["#2a6564", "#bdc369", "#5fb498"],
    params: { numCells: 69.5, tones: "3", tileSize: 118.4, scale: 0.3148, segments: 8, frequency: 2, lineWidth: 0.0352, rotation: 0, randomRotation: 0 } },
  // Georgia's export voronoi-islamic-v2 (1), 14 Nov: nested squares in blush, teal, rose and cream
  { name: "Rose Squares", gen: voronoiIslamicV2, size: 1.5, kind: "cells", colours: ["#e4ad9a", "#5aa094", "#bc5c6b", "#e6e9cd"],
    params: { numCells: 64.25, tones: "4", tileSize: 164.8, scale: 0.4016, segments: 4, frequency: 4, lineWidth: 0.0296, rotation: 25.714285714285715, randomRotation: 0 } },
  // Georgia's export islamic-rosette (4), 14 Nov: six-point rosette, rotated 30° (replaces Cream Rosette).
  // Recoloured magenta / blush / berry (her pick from calmer palettes); tone 4 is needed for tone 3 to show.
  { name: "Magenta Rosette", gen: islamic, svg: islamicSvg, size: 1.5, colours: ["#c4359b", "#ffd0e8", "#7a1659", "#7a1659"],
    params: { tileShape: "hexagon", tones: "4", tileSize: 72, scale: 0.3344, segments: 6, frequency: 1, lineWidth: 0.0758, rotation: 30 } },
  { name: "Overlook Diamonds", gen: islamic, svg: islamicSvg, size: 1.5, colours: ["#493127", "#9d0b0b", "#da6110"],
    params: { tileShape: "square", tones: "3", tileSize: 99.2, scale: 0.354, segments: 4, frequency: 1, lineWidth: 0.15, rotation: 0 } },
  { name: "Tropical Bones", gen: escher, svg: escherSvg, size: 1.5, colours: ["#fd7f58", "#ffeeb3", "#f04790", "#fddddd", "#a7e633"],
    params: { tileShape: "square", tones: "5", tileSize: 88, scale: 0.48, segments: 8, frequency: 6, lineWidth: 0.0954, rotation: 22.5, baseShape: "square", bumpAmp: 10.97, bumpType: "wave" } },
  // Georgia's export escher-translation (1), 14 Nov: wavy hexagon stars in yellow, teal and sky
  { name: "Sky Stars", gen: escher, svg: escherSvg, size: 1.5, colours: ["#fbc604", "#10afb1", "#8cc5e8", "#e5f9ff"],
    params: { baseShape: "hexagon", bumpType: "wave", tones: "4", tileSize: 52, bumpAmp: 13.73 } },
  { name: "Amber Weave", gen: recursive, svg: recursiveSvg, size: 2.5, kind: "wrap", colours: ["#ffc23d", "#fd8e26"],
    params: { mode: "grid", depth: 3, subdivisions: 4 } },
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const RGB = PRESETS.map((p) => p.colours.map(hex));

// Pattinator's own colour mapping (render.js): colour1 = +1 … colourN = -1, blended between stops.
function paint(px, o, v, C) {
  const seg = ((1 - Math.max(-1, Math.min(1, v))) / 2) * (C.length - 1);
  const i = Math.min(C.length - 2, Math.floor(seg)), f = seg - i, a = C[i], b = C[i + 1];
  px[o] = a[0] + (b[0] - a[0]) * f; px[o + 1] = a[1] + (b[1] - a[1]) * f; px[o + 2] = a[2] + (b[2] - a[2]) * f; px[o + 3] = 255;
}

// One frame. w × h canvas pixels; `ppu` = canvas pixels per Pattinator pixel at size 1.
export function drawFrame(index, w, h, ppu, seed) {
  const p = PRESETS[index];
  const k = ppu * p.size;
  const dw = w / k, dh = h / k;
  const params = { ...p.params, seed };
  if (p.kind === "cells") {
    CANVAS.WIDTH = dw; CANVAS.HEIGHT = dh;
    params.numCells = p.params.numCells * (dw * dh) / (500 * 500);
  } else { CANVAS.WIDTH = 500; CANVAS.HEIGHT = 500; }
  const px = new Uint8ClampedArray(w * h * 4), C = RGB[index], wrap = p.kind === "wrap";
  // `ridge` < 1 narrows ridge-noise lines (colour1, value +1) so they read more distinctly; settings unchanged
  const r = p.ridge || 1;
  for (let y = 0, o = 0; y < h; y++) {
    const uy = y / k;
    for (let x = 0; x < w; x++, o += 4) {
      const ux = x / k;
      let v = p.gen(wrap ? ux % 500 : ux, wrap ? uy % 500 : uy, params);
      if (r !== 1) v = 1 - 2 * Math.pow(Math.max(0, (1 - v) / 2), r);
      paint(px, o, v, C);
    }
  }
  CANVAS.WIDTH = 500; CANVAS.HEIGHT = 500;
  return px;
}

// Vector patterns: the SVG in Pattinator units, plus the scale `k` (canvas px per unit). "wrap" patterns
// come back as one 500-unit square for the main thread to repeat.
export function drawVector(index, w, h, ppu, seed) {
  const p = PRESETS[index], k = ppu * p.size;
  const wrap = p.kind === "wrap";
  const uw = wrap ? 500 : w / k, uh = wrap ? 500 : h / k;
  const params = { ...p.params, seed, tones: p.params.tones ?? String(p.colours.length) };
  p.colours.forEach((c, j) => { params["colour" + (j + 1)] = c; });
  if (p.kind === "cells") { CANVAS.WIDTH = uw; CANVAS.HEIGHT = uh; params.numCells = p.params.numCells * (uw * uh) / (500 * 500); }
  const svg = p.svg(uw, uh, params);
  CANVAS.WIDTH = 500; CANVAS.HEIGHT = 500;
  return { svg, k, wrap };
}

self.onmessage = (e) => {
  const { w, h, ppu, order, seed } = e.data;
  for (const i of order) {
    if (PRESETS[i].svg) { postMessage({ i, ...drawVector(i, w, h, ppu, seed) }); continue; }
    const px = drawFrame(i, w, h, ppu, seed);
    postMessage({ i, px }, [px.buffer]);
  }
};
