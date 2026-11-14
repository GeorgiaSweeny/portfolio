/*
========================================
ESCHER TYPE I — SVG RENDERER
========================================
* Traces exact tile boundary curves as filled SVG paths.
* Supports square and hexagonal base polygons.
*
* Reference:
*   NGV Digital Creatives: Tessellate by Code Workshop Instructions
*   Escher x Nendo: Between Two Worlds, National Gallery of Victoria, 2018–19
*   https://www.ngv.vic.gov.au/wp-content/uploads/2019/01/
*     NGV-Digital-Creatives-Tessellate-by-Code-Workshop-Instructions.pdf
*
* SQUARE tile (col, row), size S:
*   Top    (left→right): x = x0+t·S,   y = y0+A·b(t)
*   Right  (top→bottom): x = x0+S+A·b(t), y = y0+t·S
*   Bottom (right→left): x = x0+S−t·S, y = y0+S+A·b(1−t)
*   Left   (bottom→top): x = x0+A·b(1−t), y = y0+S−t·S
*
* HEX tile (q, r), circumradius S, pointy-top:
*   6 edges k=0..5, each traced with outward deformation A·b(t)·n̂_k
*   where n̂_k = (cos((k+1)π/3), sin((k+1)π/3))
*
* Boundary correctness: all bump functions satisfy b(t)+b(1−t)=0
* (antisymmetry). This guarantees that opposite-facing edge traces
* from adjacent tiles agree on the shared boundary — no gaps or overlaps.
*
* API: escherSvg(width, height, params) → SVG string
*/

import { svgFillsFor } from "../lib/colourMapping.js";

const SQ3 = Math.sqrt(3);
const N   = 48; // sample points per edge

export function escherSvg(width, height, params) {
   const {
      tileSize = 60, bumpAmp = 10, bumpType = "wave",
      baseShape = "square", tones = "2",
      colour1, colour2, colour3, colour4, colour5,
   } = params;
   const S    = tileSize;
   const A    = Math.min(bumpAmp, S * 0.38);
   const fill = svgFillsFor(tones, [colour1, colour2, colour3, colour4, colour5]);

   const parts = baseShape === "hexagon"
      ? _hexParts(width, height, S, A, bumpType, fill)
      : _squareParts(width, height, S, A, bumpType, fill);

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Square ────────────────────────────────────────────────────────────────────

// Square 2-tone: (col+row)%2 → 0=background, 1=dark
// Square 3-tone: (col+row)%3 → 0=background, 1=mid, 2=dark
// (col+row)%3 is a valid 3-colouring — no two orthogonal neighbours share a value.
function _squareParts(width, height, S, A, bumpType, fill) {
   const cols = Math.ceil(width  / S) + 3;
   const rows = Math.ceil(height / S) + 3;
   const mod  = fill.length;
   const out  = [`<rect width="${width}" height="${height}" fill="${fill[0]}"/>`];

   for (let row = -2; row < rows; row++) {
      for (let col = -2; col < cols; col++) {
         const idx = (((col + row) % mod) + mod) % mod;
         if (idx === 0) continue;
         out.push(_squareTile(col, row, S, A, bumpType, fill[idx]));
      }
   }
   return out;
}

function _squareTile(col, row, S, A, bumpType, fill) {
   const x0  = col * S;
   const y0  = row * S;
   const pts = [];

   for (let i = 0; i <= N; i++) { const t = i/N; pts.push(x0+t*S,               y0+A*_b(t,bumpType));      } // top
   for (let i = 1; i <= N; i++) { const t = i/N; pts.push(x0+S+A*_b(t,bumpType), y0+t*S);                  } // right
   for (let i = 1; i <= N; i++) { const t = i/N; pts.push(x0+S-t*S,             y0+S+A*_b(1-t,bumpType));  } // bottom
   for (let i = 1; i <= N; i++) { const t = i/N; pts.push(x0+A*_b(1-t,bumpType), y0+S-t*S);                } // left

   return _path(pts, fill);
}

// ── Hexagon ───────────────────────────────────────────────────────────────────
// Pointy-top hexagons in axial (q, r) coordinates.
// Center: cx = S·(√3·q + √3/2·r),  cy = S·(3/2·r)
// Vertex k angle: π/6 + k·π/3
// Outward normal for edge k: angle = (k+1)·π/3
//
// Hex 2-tone: ((q+r)%2+2)%2 → 0=background, 1=dark
// Hex n-tone (n >= 3): ((2q+r)%n+n)%n — the standard proper 3-colouring of
// the honeycomb lattice, generalised (see lib/latticeIndex.js's
// hexagonIndex for the same generalisation and its verification).

function _hexParts(width, height, S, A, bumpType, fill) {
   const rMax = Math.ceil(height / (1.5 * S)) + 3;
   const qMax = Math.ceil(width  / (SQ3 * S)) + 3;
   const out  = [`<rect width="${width}" height="${height}" fill="${fill[0]}"/>`];

   for (let r = -2; r <= rMax; r++) {
      for (let q = -qMax; q <= qMax; q++) {
         const n = fill.length;
         const idx = n >= 3
            ? (((2 * q + r) % n) + n) % n
            : (((    q + r) % 2) + 2) % 2;
         if (idx === 0) continue;
         out.push(_hexTile(q, r, S, A, bumpType, fill[idx]));
      }
   }
   return out;
}

function _hexTile(q, r, S, A, bumpType, fill) {
   const cx  = S * (SQ3 * q + SQ3 / 2 * r);
   const cy  = S * (1.5 * r);
   const pts = [];

   for (let k = 0; k < 6; k++) {
      const a0 = Math.PI / 6 + k       * Math.PI / 3;
      const a1 = Math.PI / 6 + (k + 1) * Math.PI / 3;

      const vx0 = cx + S * Math.cos(a0);
      const vy0 = cy + S * Math.sin(a0);
      const vx1 = cx + S * Math.cos(a1);
      const vy1 = cy + S * Math.sin(a1);

      // Outward unit normal for edge k
      const na = (k + 1) * Math.PI / 3;
      const nx = Math.cos(na);
      const ny = Math.sin(na);

      const start = k === 0 ? 0 : 1; // avoid duplicate corner points
      for (let i = start; i <= N; i++) {
         const t = i / N;
         const b = A * _b(t, bumpType);
         pts.push(
            vx0 + t * (vx1 - vx0) + b * nx,
            vy0 + t * (vy1 - vy0) + b * ny,
         );
      }
   }

   return _path(pts, fill);
}

// ── Shared helpers ────────────────────────────────────────────────────────────

// All satisfy b(t)+b(1−t)=0 (antisymmetry) — required for boundary consistency.
function _b(t, type) {
   switch (type) {
      case "wave":   return Math.sin(Math.PI * 2 * t);
      case "zigzag": return t < 0.25 ? 4*t : t < 0.75 ? 2 - 4*t : 4*t - 4;
      case "notch":  return Math.tanh(8 * Math.sin(Math.PI * 2 * t));
      default:       return Math.sin(Math.PI * 2 * t);
   }
}

function _path(pts, fill) {
   const d = [];
   for (let i = 0; i < pts.length; i += 2) {
      d.push(`${i === 0 ? "M" : "L"}${_r(pts[i])},${_r(pts[i + 1])}`);
   }
   return `<path d="${d.join(" ")} Z" fill="${fill}"/>`;
}

function _r(n) { return Math.round(n * 100) / 100; }
