/*
========================================
STAR POLYGON
========================================
* Builds the classic {n/k} star-polygon silhouette: join every point of a
* Radial Divisions ring to the one `skip` steps around, then derive the
* self-intersecting outline (tip vertices alternating with waist vertices
* at the actual chord crossings). See docs/generators/islamic.md for the
* construction and its golden-ratio sanity check.
*/

export function starSkip(n) {
   return n % 2 === 0 ? Math.max(1, n / 2 - 1) : Math.floor(n / 2);
}

// Where two infinite lines (through p1-p2 and p3-p4) cross, or null if
// they're parallel (or nearly enough that the intersection is unreliable).
export function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
   const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
   if (Math.abs(d) < 1e-9) return null;
   const a = x1 * y2 - y1 * x2;
   const b = x3 * y4 - y3 * x4;
   return {
      x: (a * (x3 - x4) - (x1 - x2) * b) / d,
      y: (a * (y3 - y4) - (y1 - y2) * b) / d,
   };
}

// The star's silhouette: ring points (tips) alternating with waist points,
// giving a closed 2n-vertex polygon [tip_0, waist_0, tip_1, waist_1, ...].
// waist_i is where chord(tip_i, tip_{i+skip}) crosses chord(tip_{i+1},
// tip_{i+1-skip}) — the two chords nearest the tip_i/tip_{i+1} gap, which
// by rotational symmetry are mirror images about that gap's bisector and so
// always cross on it. Falls back to the tip midpoint for degenerate
// (near-parallel) chord pairs at small n, so this stays total for every n.
export function starOutline(points, skip) {
   const n = points.length / 2;
   const tip = (i) => {
      const k = ((i % n) + n) % n;
      return [points[k * 2], points[k * 2 + 1]];
   };

   const outline = new Float32Array(n * 4);
   for (let i = 0; i < n; i++) {
      const [tx, ty] = tip(i);
      outline[i * 4] = tx;
      outline[i * 4 + 1] = ty;

      const [ax, ay] = tip(i);
      const [bx, by] = tip(i + skip);
      const [cx, cy] = tip(i + 1);
      const [dx, dy] = tip(i + 1 - skip);
      const hit = lineIntersect(ax, ay, bx, by, cx, cy, dx, dy);
      outline[i * 4 + 2] = hit ? hit.x : (tx + cx) / 2;
      outline[i * 4 + 3] = hit ? hit.y : (ty + cy) / 2;
   }
   return outline;
}
