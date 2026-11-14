/*
========================================
SUBDIVIDE
========================================
* Maps to the "Subdivide" pattern-construction node (docs/nodes/node-model-specification.md,
* Pattern Construction category: Repeat, Tile, Subdivide; documented in
* docs/nodes/pattern/subdivide.md). Divides a unit square into an n x n grid of cells
* and reports which cell a point falls in, plus that point remapped back into unit-square
* coordinates so the same subdivision can be applied again one level down.
*/
export function subdivideCell(x, y, n) {
   return {
      gx: Math.floor(x * n),
      gy: Math.floor(y * n),
      x: (x * n) % 1,
      y: (y * n) % 1,
   };
}
