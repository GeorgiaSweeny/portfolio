/*
========================================
VORONOI — SVG RENDERER
========================================
Computes exact Voronoi cell polygons using Sutherland-Hodgman half-plane
clipping. Each cell starts as the full canvas bounding box and is
progressively clipped by the perpendicular bisector between its seed and
every other seed.

Seed generation uses the same xorshift32 RNG and layout as voronoi.js so
SVG and raster outputs match exactly.
*/
import { svgFillsFor } from "../lib/colourMapping.js";

export function voronoiSvg(width, height, params) {
   const {
      numCells = 20, seed = 1337, tones = "2",
      colour1, colour2, colour3, colour4, colour5,
   } = params;
   const seeds = _generateSeeds(numCells, seed, width, height);
   const n     = seeds.length / 2;
   const fill  = svgFillsFor(tones, [colour1, colour2, colour3, colour4, colour5]);

   const parts = [];

   for (let i = 0; i < n; i++) {
      const px = seeds[i * 2], py = seeds[i * 2 + 1];
      let cell = [[0, 0], [width, 0], [width, height], [0, height]];

      for (let j = 0; j < n; j++) {
         if (i === j) continue;
         cell = _clip(cell, px, py, seeds[j * 2], seeds[j * 2 + 1]);
         if (cell.length === 0) break;
      }

      if (cell.length < 3) continue;
      parts.push(_poly(cell.flat(), fill[i % fill.length]));
   }

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Geometry ──────────────────────────────────────────────────────────────────

// Sutherland-Hodgman: clip convex polygon against the half-plane closer to
// (px,py) than (qx,qy). Boundary is the perpendicular bisector.
// A point is inside if: 2(qx-px)·x + 2(qy-py)·y ≤ qx²-px²+qy²-py²
function _clip(poly, px, py, qx, qy) {
   const a = 2 * (qx - px);
   const b = 2 * (qy - py);
   const c = qx * qx - px * px + qy * qy - py * py;
   const inside = ([x, y]) => a * x + b * y <= c;

   const out = [];
   for (let i = 0; i < poly.length; i++) {
      const curr = poly[i];
      const next = poly[(i + 1) % poly.length];
      const cIn  = inside(curr);
      const nIn  = inside(next);
      if (cIn) out.push(curr);
      if (cIn !== nIn) out.push(_intersect(curr, next, a, b, c));
   }
   return out;
}

function _intersect([x1, y1], [x2, y2], a, b, c) {
   const dx = x2 - x1, dy = y2 - y1;
   const t  = (c - a * x1 - b * y1) / (a * dx + b * dy);
   return [x1 + t * dx, y1 + t * dy];
}

// ── Seed generation (mirrors voronoi.js exactly) ──────────────────────────────

function _generateSeeds(numCells, seed, width, height) {
   const n   = Math.max(2, Math.round(numCells));
   let   s   = (seed >>> 0) || 1;
   const rng = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
   const seeds = new Float32Array(n * 2);
   for (let i = 0; i < n; i++) {
      seeds[i * 2]     = rng() * width;
      seeds[i * 2 + 1] = rng() * height;
   }
   return seeds;
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function _poly(coords, fill) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) {
      pts.push(`${r(coords[i])},${r(coords[i + 1])}`);
   }
   return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function r(n) { return Math.round(n * 100) / 100; }
