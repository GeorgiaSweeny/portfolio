/*
========================================
LATTICE INDEX
========================================
* Maps to the "Lattice Index" computation node (docs/nodes/computation/lattice-index.md):
* assigns a discrete colour-class index to a position within a regular,
* infinitely repeating tiling, using shape-specific coordinate arithmetic.
*
* Distinct from Partition (docs/nodes/computation/partition.md): Partition
* searches a finite seed-point set, but a plane tiling has none to search
* against, so each shape computes its cell index directly from closed-form
* coordinate math instead (an oblique basis change for triangle, cube
* coordinates for hexagon, a running-bond row offset for brick, a
* 45-degree-rotated frame for diamond).
*/

// (col+row) mod n — proper n-colouring, no two orthogonal neighbours share a value.
export function squareIndex(x, y, size, numShades) {
   return _mod(Math.floor(x / size) + Math.floor(y / size), numShades);
}

// Equilateral triangle grid via oblique coordinates; sf+tf < 1 -> up (▲),
// else down (▽). Colouring by (si+ti) mod numShades (offset between up/down)
// gives a proper n-colouring for numShades >= 3 (verified n=3..5); numShades
// = 2 can't use that formula (a neighbour delta collides mod 2), so it keeps
// a simpler up/down split.
export function triangleIndex(x, y, size, numShades) {
   const t  = (2 / Math.sqrt(3)) * y / size;
   const s  = (x / size) - t / 2;
   const si = Math.floor(s), ti = Math.floor(t);
   const up = (s - si) + (t - ti) < 1;

   return numShades >= 3
      ? _mod(si + ti + (up ? 0 : -1), numShades)
      : (up ? 0 : 1);
}

// Brick units are 2:1, rows offset by half a brick width (running bond).
// Plain (col+row) mod n would put same-tone bricks in contact; doubling
// column resolution (fineCol) restores a proper n-colouring for numShades
// >= 3 (verified n=3..5). numShades = 2 keeps the simpler (col+row) mod 2 split.
export function brickIndex(x, y, size, numShades) {
   const bw    = size * 2;
   const bh    = size;
   const row   = Math.floor(y / bh);
   const shift = (row % 2) * (bw / 2);
   const col   = Math.floor((x + shift) / bw);

   if (numShades >= 3) {
      const fineCol = 2 * col - (row % 2);
      return _mod(fineCol, numShades);
   }
   return _mod(col + row, 2);
}

// Rotate the coordinate frame 45° before applying the square grid.
export function diamondIndex(x, y, size, numShades) {
   const u = (x + y) / Math.SQRT2;
   const v = (x - y) / Math.SQRT2;
   return _mod(Math.floor(u / size) + Math.floor(v / size), numShades);
}

// Pointy-top hexagons via cube coordinates + rounding. n-tone (n >= 3):
// (2q+r) mod n is a proper colouring since its six neighbour deltas
// ({±1, ±2}) are never ≡ 0 mod n (verified n=3..5). 2-tone falls back to
// (q+r) mod 2, which (2q+r) mod 2 can't cover (a delta of 2 would collide).
export function hexagonIndex(x, y, size, numShades) {
   const [qi, ri] = _hexCell(x, y, size);
   return numShades >= 3
      ? _mod(2 * qi + ri, numShades)
      : _mod(qi + ri, 2);
}

// Centre of the hexagon cell (x, y) falls in — shares _hexCell's rounding
// with hexagonIndex so "which cell" and "where is its centre" agree.
// Used by islamic.js to place a rosette at each hex tile's centroid.
export function hexagonCentroid(x, y, size) {
   const [qi, ri] = _hexCell(x, y, size);
   return [size * Math.sqrt(3) * (qi + ri / 2), size * 1.5 * ri];
}

// Shared cube-coordinate rounding: which axial cell (qi, ri) does (x, y)
// fall in, for a pointy-top hex grid of circumradius `size`.
function _hexCell(x, y, size) {
   const q = (Math.sqrt(3) / 3 * x - y / 3) / size;
   const r = (2 / 3 * y) / size;
   const s = -q - r;

   let qi = Math.round(q), ri = Math.round(r), si = Math.round(s);
   const qd = Math.abs(qi - q), rd = Math.abs(ri - r), sd = Math.abs(si - s);
   if      (qd > rd && qd > sd) qi = -ri - si;
   else if (rd > sd)             ri = -qi - si;

   return [qi, ri];
}

function _mod(n, m) { return ((n % m) + m) % m; }
