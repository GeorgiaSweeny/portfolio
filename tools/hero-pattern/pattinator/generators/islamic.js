/*
========================================
ISLAMIC GEOMETRIC ROSETTE GENERATOR
========================================
* Composition: Grid (tile lookup) -> Construction Circle -> Radial Divisions
* -> Star Polygon (silhouette) -> Distance Field (signed, to the
*    silhouette's own boundary) -> Colour Mapping. See docs/generators/islamic.md
*    for the star-polygon construction and its golden-ratio sanity check.
*
* Implementation notes not covered by the doc:
* - skip (the {n/k} in the star) is starPolygon.js's starSkip(n), kept
*   proportional to n rather than fixed at 2, so the waist/tip ratio stays
*   in a legible ~0.35-0.6 range for every n instead of drifting to a
*   near-circle as n grows.
* - Rendered as thin lines (signed distance to the silhouette boundary,
*   within lineWidth*radius of a ring multiple), not filled bands — filled
*   bands read as op-art texture rather than Islamic line art below n~8.
* - `frequency` is a ring count relative to the medallion's own radius
*   (`step = radius / frequency`), so ring density stays consistent across
*   tileSize rather than a fixed spatial frequency swamping small tiles.
* - `lineWidth` sets thickness as a fraction of radius directly, independent
*   of `frequency`'s ring spacing.
* - `scale` is Construction Circle's radius param, capped below 0.5 so the
*   medallion stays inside its own tile (no cross-tile interaction).
* - `rotation` snaps to multiples of 180/segments (not 360/segments): the
*   star has n-fold rotational symmetry (360/n does nothing visually) plus
*   n reflection axes spaced 180/n apart, so 180/n is the finest increment
*   that both changes the shape and preserves vertical symmetry, alternating
*   a tip-up/waist-up reading of the same star each step.
*/
import { constructionCircle, radialDivisions } from "./lib/constructionCircle.js";
import { nearestSegmentDistSq, pointInPolygon } from "./lib/distanceField.js";
import { starOutline, starSkip } from "./lib/starPolygon.js";
import { toneSet, bandTone } from "./lib/colourMapping.js";
import { hexagonCentroid } from "./lib/latticeIndex.js";

// Snaps rotation to the nearest multiple of 180/segments (see header).
// Exported so islamic-svg.js and the test oracle share one implementation.
export function snapRotation(rotationDeg, segments) {
   const n = Math.max(3, Math.round(segments));
   const stepDeg = 180 / n;
   return Math.round((rotationDeg ?? 0) / stepDeg) * stepDeg;
}

// Construction points depend only on (segments, radius, rotation) —
// deterministic and tile-independent, so a single small cache covers
// the whole canvas.
const _outlineCache = new Map();
function getOutline(segments, radius, rotationDeg) {
   const snappedDeg = snapRotation(rotationDeg, segments);
   const key = `${segments}|${radius}|${snappedDeg}`;
   if (!_outlineCache.has(key)) {
      const n = Math.max(3, Math.round(segments));
      const circle = constructionCircle(0, 0, radius);
      // Base alignment at 90 degrees (not 0) puts a vertex on the vertical
      // axis, making every medallion mirror-symmetric left/right to match
      // its tile neighbours; `rotation` adds on top of this base.
      const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
      _outlineCache.set(key, starOutline(points, starSkip(n)));
   }
   return _outlineCache.get(key);
}

export function islamic(x, y, params) {
   const {
      tileSize = 100,
      segments = 8,
      frequency = 0.15,
      lineWidth = 0.06,
      tones = "2",
      tileShape = "square",
      scale = 0.42,
      rotation = 0,
   } = params;

   const shades = toneSet(tones);

   // Which tile (x, y) is in, and its centroid — square cell, or hexagon
   // via lib/latticeIndex.js's hexagonCentroid (shared with grid.js).
   const [cx, cy] = tileShape === "hexagon"
      ? hexagonCentroid(x, y, tileSize)
      : _squareCentroid(x, y, tileSize);

   // Local coordinates relative to this tile's construction-circle centre.
   const lx = x - cx, ly = y - cy;

   const radius = tileSize * scale;
   const outline = getOutline(segments, radius, rotation);
   const edges = _outlineEdges(outline);

   const dist = Math.sqrt(nearestSegmentDistSq(lx, ly, edges));
   const inside = pointInPolygon(lx, ly, outline);
   const signedDist = inside ? -dist : dist;

   // Ring spacing relative to radius (see header); distance from this
   // pixel's band position to the nearest ring (the medallion's own
   // edge, signedDist = 0, is always one).
   const step = radius / frequency;
   const bandPos = signedDist / step;
   const nearestBand = Math.round(bandPos);
   const distToLine = Math.abs(bandPos - nearestBand) * step;
   const onLine = distToLine < lineWidth * radius;

   if (!onLine) return shades[0];
   return bandTone(shades, nearestBand);
}

function _squareCentroid(x, y, tileSize) {
   const col = Math.floor(x / tileSize);
   const row = Math.floor(y / tileSize);
   return [(col + 0.5) * tileSize, (row + 0.5) * tileSize];
}

// starOutline() returns a closed vertex list; turn it into the
// [x1,y1,x2,y2,...] edge list nearestSegmentDistSq expects. Cached
// alongside the outline itself since it's a pure function of it.
const _edgeCache = new Map();
function _outlineEdges(outline) {
   if (!_edgeCache.has(outline)) {
      const n = outline.length / 2;
      const edges = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
         const j = (i + 1) % n;
         edges[i * 4] = outline[i * 2];
         edges[i * 4 + 1] = outline[i * 2 + 1];
         edges[i * 4 + 2] = outline[j * 2];
         edges[i * 4 + 3] = outline[j * 2 + 1];
      }
      _edgeCache.set(outline, edges);
   }
   return _edgeCache.get(outline);
}
