/*
========================================
RECURSIVE / FRACTAL — SVG RENDERER
========================================
Enumerates all black cells by walking the same recursive subdivision tree
as recursive.js, for both of its modes:

  "sierpinski" — early-exit: the centre cell (gx === mid, gy === mid) is
  black; all others recurse to depth-1. depth=0 is always white.

  "grid" — no early exit: every level recurses regardless of cell, and a
  cell is black only once a *leaf* (depth 0) is reached with odd running
  parity — same running (gx+gy) parity accumulation as recursive.js's
  "grid" mode, just enumerated instead of sampled per-pixel.

Element count for Sierpinski (sub=3):
  depth 1 → 1 rect   depth 4 → 585 rects
  depth 2 → 9        depth 5 → 4,681
  depth 3 → 73       depth 6 → 37,449  (large but valid SVG)
*/

export function recursiveSvg(width, height, params) {
   const {
      depth = 4, subdivisions: sub = 3, mode = "sierpinski",
      colour1 = "#ffffff", colour2 = "#000000",
   } = params;

   const rects = [];
   _enumerate(0, 0, width, height, depth, sub, mode, 0, rects);

   const rectEls = rects.map(
      ([x, y, w, h]) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${colour2}"/>`
   );

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${colour1}"/>${rectEls.join("")}</svg>`;
}

// Recursively finds all black cells and pushes their [x, y, w, h] to `out`.
// `parity` is the running (gx+gy) parity accumulated so far, used by "grid" mode.
function _enumerate(x, y, w, h, depth, sub, mode, parity, out) {
   const mid   = Math.floor(sub / 2);
   const cellW = w / sub;
   const cellH = h / sub;

   if (depth === 0) {
      if (mode === "grid" && parity % 2 === 1) out.push([x, y, w, h]);
      return;
   }

   for (let gy = 0; gy < sub; gy++) {
      for (let gx = 0; gx < sub; gx++) {
         const cx = x + gx * cellW;
         const cy = y + gy * cellH;
         if (mode === "sierpinski" && gx === mid && gy === mid) {
            out.push([cx, cy, cellW, cellH]);
         } else {
            _enumerate(cx, cy, cellW, cellH, depth - 1, sub, mode, parity + gx + gy, out);
         }
      }
   }
}

function r(n) { return Math.round(n * 100) / 100; }
