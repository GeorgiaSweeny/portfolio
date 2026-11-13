/*
========================================
CONSTRUCTION CIRCLE / RADIAL DIVISIONS
========================================
* Maps to two generation nodes:
*   - "Construction Circle" (docs/nodes/generation/construction-circle.md):
*     defines the centre and radius that later radial structure is built from.
*   - "Radial Divisions" (docs/nodes/pattern/radial-divisions.md): divides that
*     circle into `segments` equally spaced points.
*
* Together these are the deterministic counterpart to Seed Points
* (src/generators/lib/seedPoints.js): both produce a point set that Distance
* Field (nearestPoint) can search, but Seed Points scatters points with an RNG
* while Radial Divisions places them at fixed angles around a centre. Same
* downstream primitive, two different point-generation strategies — one
* stochastic (Voronoi), one deterministic (Islamic Geometric Patterns).
*/

// Trivial in isolation, but kept as its own stage so the node graph can show
// "define the circle" as a distinct step from "divide it".
export function constructionCircle(cx, cy, radius) {
   return { cx, cy, radius };
}

// n points evenly spaced around a construction circle, starting at `rotation`.
export function radialDivisions(circle, segments, rotation = 0) {
   const n = Math.max(3, Math.round(segments));
   const points = new Float32Array(n * 2);
   for (let i = 0; i < n; i++) {
      const angle = rotation + (i * 2 * Math.PI) / n;
      points[i * 2]     = circle.cx + circle.radius * Math.cos(angle);
      points[i * 2 + 1] = circle.cy + circle.radius * Math.sin(angle);
   }
   return points;
}
