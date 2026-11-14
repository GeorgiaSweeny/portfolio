/*
========================================
ISLAMIC GEOMETRIC ROSETTE — SVG RENDERER
========================================
* Renders one medallion's rings once (lib/starPolygon.js's starOutline,
* stroked not filled — see docs/generators/islamic.md) and repeats it
* across the canvas via an SVG <pattern>, matching islamic.js's raster
* construction band-for-band.
*
* Implementation notes not covered by the doc:
* - Each cell is clipped (<clipPath>) since a native <pattern> doesn't clip
*   its own content to the tile size, and outward bands can reach past a
*   cell's own half-width; without clipping, overlapping cell copies
*   interfere into a moire mess.
* - Each ring is a true perpendicular polygon offset of the silhouette
*   (edges shifted along their own normal, new vertices from consecutive
*   shifted edges' intersections) — lib/polygonOffset.js's offsetPolygon
*   and buildOffsetBands, shared with voronoiIslamicV2.js's raster reuse
*   of this same ring construction. This naive per-vertex-miter offset
*   only stays valid up to a limited band count in either direction (an
*   inward waist vertex can invert through a collapse point; a large
*   outward offset can self-intersect non-adjacent arms) —
*   lib/polygonOffset.js's `maxBandsFor` caps it per `segments`, confirmed
*   visually rather than derived in closed form. Stroking (not filling)
*   makes overshoot a soft failure (stray lines, not a solid mess).
* - "hexagon" cells draw two medallions (one per row phase) at every
*   offset in a 3x3 super-grid of tile-period shifts, each left to its own
*   clip — the standard brute-force trick for tiling a hex lattice with a
*   rectangular SVG <pattern> without dropping content at a seam.
*
* API: islamicSvg(width, height, params) → SVG string
*/

import { starOutline, starSkip } from "../lib/starPolygon.js";
import { radialDivisions, constructionCircle } from "../lib/constructionCircle.js";
import { bandTone, svgFillsFor, DEFAULT_COLOURS } from "../lib/colourMapping.js";
import { snapRotation } from "../islamic.js";
import { maxBandsFor, buildOffsetBands } from "../lib/polygonOffset.js";

// Greyscale by default via svgFillsFor's monotonic ramp (lib/colourMapping.js,
// shared with the other tone-indexed SVG renderers); each slot is
// independently user-editable via colour1..colour5. Re-exported so existing
// imports of DEFAULT_COLOURS from this file keep working.
export { DEFAULT_COLOURS };

export function islamicSvg(width, height, params) {
   const {
      tileSize = 100, segments = 8, frequency = 0.15, lineWidth = 0.06,
      tones = "2", tileShape = "square", scale = 0.42, rotation = 0,
      colour1, colour2, colour3, colour4, colour5,
   } = params;

   const n = Math.max(3, Math.round(segments));
   const radius = tileSize * scale; // self-contained medallion — see islamic.js
   const fill = svgFillsFor(tones, [colour1, colour2, colour3, colour4, colour5]);

   const circle = constructionCircle(0, 0, radius);
   // Base alignment (tip 0 at 90 degrees) plus `rotation`, snapped to
   // 180/segments — see islamic.js's header comment and snapRotation
   // (shared, not re-derived here) for why that increment.
   const snappedDeg = snapRotation(rotation, n);
   const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
   const outline = starOutline(points, starSkip(n));
   const rings = _buildRings(outline, radius, frequency, lineWidth, fill, maxBandsFor(n));

   return tileShape === "hexagon"
      ? _hexPattern(width, height, tileSize, rings)
      : _squarePattern(width, height, tileSize, rings);
}

// ── Cell layouts ─────────────────────────────────────────────────────────

function _squarePattern(width, height, tileSize, rings) {
   const S = tileSize;
   // The clip rect is defined in the group's own (already-translated)
   // local frame — same frame the medallion rings are drawn in, centred
   // on local (0, 0) — so it must be centred there too (-S/2..S/2), not
   // at the tile's absolute 0..S.
   const clipShape = `<rect x="${-S / 2}" y="${-S / 2}" width="${S}" height="${S}"/>`;
   const cell = _ringsGroup(rings, S / 2, S / 2, clipShape, "sq-clip");

   const defs = [cell.clipDef, `<pattern id="islamic-tile" x="0" y="0" width="${S}" height="${S}" patternUnits="userSpaceOnUse">${cell.group}</pattern>`];
   return _svgTag(width, height, defs);
}

function _hexPattern(width, height, tileSize, rings) {
   // Pointy-top hex lattice, matching lib/latticeIndex.js's hexagonCentroid:
   // horizontal period W = tileSize * sqrt(3) (one hex's own flat-to-flat
   // width), vertical period H = tileSize * 3 covering the two row phases.
   const W = tileSize * Math.sqrt(3);
   const H = tileSize * 3;
   const hexPoints = _hexagonPoints(tileSize);
   const clipDef = `<clipPath id="hex-clip"><polygon points="${_ptsStr(hexPoints)}"/></clipPath>`;

   // The two row-phase centres within one rectangular repeat unit —
   // see this file's header comment for why each needs the 3x3 offset
   // duplication below rather than a single placement.
   const centres = [
      [0, tileSize],           // row phase A
      [W / 2, tileSize * 2.5], // row phase B (offset by W/2 horizontally, H/2 vertically)
   ];

   const groups = [];
   for (const [bx, by] of centres) {
      for (const dx of [-W, 0, W]) {
         for (const dy of [-H, 0, H]) {
            const px = bx + dx, py = by + dy;
            // Skip instances that can't possibly reach the [0,W]x[0,H] tile
            // box — a hex of circumradius tileSize is fully outside it once
            // its centre is more than tileSize away from every edge.
            if (px < -tileSize || px > W + tileSize || py < -tileSize || py > H + tileSize) continue;
            groups.push(
               `<g clip-path="url(#hex-clip)" transform="translate(${_r(px)},${_r(py)})">${rings.join("")}</g>`
            );
         }
      }
   }

   const defs = [clipDef, `<pattern id="islamic-tile" x="0" y="0" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${groups.join("")}</pattern>`];
   return _svgTag(width, height, defs);
}

function _ringsGroup(rings, cx, cy, clipShape, clipId) {
   const clipDef = `<clipPath id="${clipId}">${clipShape}</clipPath>`;
   const group = `<g clip-path="url(#${clipId})" transform="translate(${_r(cx)},${_r(cy)})">${rings.join("")}</g>`;
   return { clipDef, group };
}

function _svgTag(width, height, defs) {
   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">` +
      `<defs>${defs.join("")}</defs><rect width="${width}" height="${height}" fill="url(#islamic-tile)"/></svg>`;
}

// Pointy-top hexagon vertices (a point straight up), matching
// lib/latticeIndex.js's hexagonCentroid convention, circumradius = size.
function _hexagonPoints(size) {
   const pts = [];
   for (let k = 0; k < 6; k++) {
      const theta = (Math.PI / 180) * (-90 + 60 * k);
      pts.push(size * Math.cos(theta), size * Math.sin(theta));
   }
   return pts;
}

// ── Medallion rings (shared by both layouts, drawn in local coordinates
// centred on the medallion's own origin — the caller translates) ───────────

function _buildRings(outline, radius, frequency, lineWidth, fill, maxBands) {
   // Relative to the medallion's own radius, not a raw spatial frequency
   // — see islamic.js's header comment for why.
   const step = radius / frequency;
   // Independent of step/frequency (see islamic.js's header comment) —
   // both sides of the line, so the total is double lineWidth * radius.
   const strokeWidth = 2 * lineWidth * radius;

   const bands = buildOffsetBands(outline, step, maxBands);

   const rings = [`<rect x="-9999" y="-9999" width="19998" height="19998" fill="${fill[0]}"/>`];
   // bandTone (lib/colourMapping.js): band 0 (the medallion's own
   // boundary) is always the darkest tone; every other echo cycles
   // through whichever tones are left — same rule islamic.js's raster
   // uses, so the two renderers agree band-for-band.
   bands.forEach(({ index, poly }) => rings.push(_strokeTag(poly, bandTone(fill, index), strokeWidth)));
   return rings;
}

function _strokeTag(poly, color, strokeWidth) {
   return `<polygon points="${_ptsStr(poly)}" fill="none" stroke="${color}" stroke-width="${_r(strokeWidth)}"/>`;
}

function _ptsStr(coords) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) pts.push(`${_r(coords[i])},${_r(coords[i + 1])}`);
   return pts.join(" ");
}

function _r(n) { return Math.round(n * 100) / 100; }
