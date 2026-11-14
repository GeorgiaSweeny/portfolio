/*
========================================
GRID TESSELLATION — SVG RENDERER
========================================
Generates a standalone SVG string for each tessellation shape.
Mirrors the math in generators/lib/latticeIndex.js but emits vector
primitives (whole cells) instead of a per-pixel scalar index.

API:  gridSvg(width, height, params) → SVG string
*/
import { svgFillsFor } from "../lib/colourMapping.js";

const SQ3 = Math.sqrt(3);

export function gridSvg(width, height, params) {
   const {
      shape = "square", tileSize: s = 40, tones = "2",
      colour1, colour2, colour3, colour4, colour5,
   } = params;
   const fill = svgFillsFor(tones, [colour1, colour2, colour3, colour4, colour5]);

   const parts = [];

   switch (shape) {
      case "square":   _square(parts, width, height, s, fill);   break;
      case "brick":    _brick(parts, width, height, s, fill);    break;
      case "hexagon":  _hexagon(parts, width, height, s, fill);  break;
      case "triangle": _triangle(parts, width, height, s, fill); break;
      case "diamond":  _diamond(parts, width, height, s, fill);  break;
   }

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Square ────────────────────────────────────────────────────────────────────
// (col + row) mod n → 0 = background, else fill[idx]

function _square(parts, W, H, s, fill) {
   const cols = Math.ceil(W / s) + 1;
   const rows = Math.ceil(H / s) + 1;
   for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
         const idx = _mod(col + row, fill.length);
         if (idx === 0) continue;   // background fill
         parts.push(_rect(col * s, row * s, s, s, fill[idx]));
      }
   }
   parts.unshift(_rect(0, 0, W, H, fill[0]));    // background
}

// ── Brick ─────────────────────────────────────────────────────────────────────
// Mirrors brickIndex in lib/latticeIndex.js: 2:1 brick units, row offset shifts x
// by half a brick width on odd rows. Each brick touches 2 neighbours per side row, so
// plain (col+row) mod n puts same-tone bricks in contact; doubled-resolution
// fineCol = 2*col - (row%2) restores a proper n-colouring for any tones count >= 3
// (see lib/latticeIndex.js's brickIndex for the generalisation and its
// brute-force verification — 2-tone keeps its own simpler split).

function _brick(parts, W, H, s, fill) {
   const bw   = s * 2;
   const bh   = s;
   const rows = Math.ceil(H / bh) + 1;
   const proper = fill.length >= 3;
   parts.push(_rect(0, 0, W, H, fill[0]));
   for (let row = 0; row < rows; row++) {
      const shift = (row % 2) * (bw / 2);
      const colStart = -1;
      const colEnd   = Math.ceil((W + shift) / bw) + 1;
      for (let col = colStart; col < colEnd; col++) {
         const idx = proper
            ? _mod(2 * col - (row % 2), fill.length)
            : _mod(col + row, 2);
         if (idx === 0) continue;
         parts.push(_rect(col * bw - shift, row * bh, bw, bh, fill[idx]));
      }
   }
}

// ── Diamond ───────────────────────────────────────────────────────────────────
// Mirrors _diamond: rotated square grid. u=(x+y)/√2, v=(x-y)/√2.
// Cell (qu,qv) center in pixel space:
//   x_c = (qu + qv + 1) * s / √2
//   y_c = (qu - qv)     * s / √2
// Diamond corners: (x_c ± s/√2, y_c) and (x_c, y_c ± s/√2)
// idx = (qu + qv) mod n → 0 = background, else fill[idx]

function _diamond(parts, W, H, s, fill) {
   const h = s / Math.SQRT2;     // half-diagonal length
   const n = Math.ceil((W + H) / s) + 2;

   parts.push(_rect(0, 0, W, H, fill[0]));

   for (let qu = -n; qu <= n; qu++) {
      for (let qv = -n; qv <= n; qv++) {
         const idx = _mod(qu + qv, fill.length);
         if (idx === 0) continue;   // background cells skipped
         const cx = (qu + qv + 1) * s / Math.SQRT2;
         const cy = (qu - qv)     * s / Math.SQRT2;
         // rough cull — skip if center is more than one full diagonal outside
         if (cx < -h * 2 || cx > W + h * 2 || cy < -h * 2 || cy > H + h * 2) continue;
         parts.push(_poly([cx, cy - h, cx + h, cy, cx, cy + h, cx - h, cy], fill[idx]));
      }
   }
}

// ── Hexagon ───────────────────────────────────────────────────────────────────
// Pointy-top hexagons in axial coordinates (q, r).
// Pixel center: x = s*(√3*q + √3/2*r),  y = s*(3/2*r)
// Hex 2-tone: (q+r) mod 2. Hex n-tone (n >= 3): (2q+r) mod n — the standard
// proper 3-colouring, generalised (see lib/latticeIndex.js's hexagonIndex).

function _hexagon(parts, W, H, s, fill) {
   const rMax = Math.ceil(H / (1.5 * s)) + 2;
   const qMax = Math.ceil(W / (SQ3 * s)) + 2;

   parts.push(_rect(0, 0, W, H, fill[0]));

   for (let r = -2; r <= rMax; r++) {
      for (let q = -qMax; q <= qMax; q++) {
         const idx = fill.length >= 3
            ? _mod(2 * q + r, fill.length)
            : _mod(q + r, 2);
         if (idx === 0) continue;
         const cx = s * (SQ3 * q + SQ3 / 2 * r);
         const cy = s * (1.5 * r);
         if (cx < -s * 2 || cx > W + s * 2 || cy < -s * 2 || cy > H + s * 2) continue;
         parts.push(_hexPoly(cx, cy, s, fill[idx]));
      }
   }
}

function _hexPoly(cx, cy, s, fillColor) {
   const pts = [];
   for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (Math.PI / 3) * i;   // 30° start for pointy-top
      pts.push(cx + s * Math.cos(a), cy + s * Math.sin(a));
   }
   return _poly(pts, fillColor);
}

// ── Triangle ──────────────────────────────────────────────────────────────────
// Oblique coordinate system: t = 2y/(√3*s),  os = x/s - t/2
// Each oblique cell (os, ot) contains two triangles:
//   up   (sf+tf < 1): corners at (os,ot), (os+1,ot), (os,ot+1)
//   down (sf+tf ≥ 1): corners at (os+1,ot), (os+1,ot+1), (os,ot+1)
// Oblique → pixel:  x = os*s + ot*s/2,  y = ot*s*√3/2
// 2-tone: up=background, down=dark (orientation split only, both suffice for a
// proper colouring since up/down triangles are never mutually adjacent).
// n-tone (n >= 3): U(os,ot) touches D(os,ot), D(os-1,ot), D(os,ot-1) —
// colouring both by (os+ot) mod n, offset by a constant between up/down,
// satisfies all three simultaneously and varies across both axes, for any
// n >= 3 (see lib/latticeIndex.js's triangleIndex for the generalisation).

function _triangle(parts, W, H, s, fill) {
   const otMax = Math.ceil(2 * H / (SQ3 * s)) + 2;
   const osMax = Math.ceil(W / s) + otMax + 2;
   const proper = fill.length >= 3;

   parts.push(_rect(0, 0, W, H, fill[0]));

   for (let ot = -1; ot <= otMax; ot++) {
      for (let os = -otMax - 1; os <= osMax; os++) {
         const idxUp   = proper ? _mod(os + ot,     fill.length) : 0;
         const idxDown = proper ? _mod(os + ot - 1, fill.length) : 1;

         if (idxUp !== 0) {
            _pushTri(parts, [_triPx(os, ot, s), _triPx(os + 1, ot, s), _triPx(os, ot + 1, s)],
                     fill[idxUp], W, H, s);
         }
         if (idxDown !== 0) {
            _pushTri(parts, [_triPx(os + 1, ot, s), _triPx(os + 1, ot + 1, s), _triPx(os, ot + 1, s)],
                     fill[idxDown], W, H, s);
         }
      }
   }
}

function _pushTri(parts, pts, fillColor, W, H, s) {
   const xs = pts.map(p => p[0]);
   const ys = pts.map(p => p[1]);
   const midX = (xs[0] + xs[1] + xs[2]) / 3;
   const midY = (ys[0] + ys[1] + ys[2]) / 3;
   if (midX < -s || midX > W + s || midY < -s || midY > H + s) return;
   parts.push(_poly(pts.flat(), fillColor));
}

function _triPx(os, ot, s) {
   return [os * s + ot * s / 2, ot * s * SQ3 / 2];
}

// ── SVG primitives ────────────────────────────────────────────────────────────

function _rect(x, y, w, h, fill) {
   return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}"/>`;
}

function _poly(coords, fill) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) {
      pts.push(`${r(coords[i])},${r(coords[i + 1])}`);
   }
   return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function r(n) { return Math.round(n * 100) / 100; }

function _mod(n, m) { return ((n % m) + m) % m; }
