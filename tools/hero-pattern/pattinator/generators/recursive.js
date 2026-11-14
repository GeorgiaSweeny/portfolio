/*
========================================
RECURSIVE GENERATOR
========================================
* Composition: Subdivide applied repeatedly via the generic Repeat combinator
* (lib/repeat.js, lib/subdivide.js). See docs/generators/recursive.md for the
* Sierpinski carpet construction and how "grid" mode differs from it.
* "sierpinski": early-exits with a hole (-1) when a level lands on the centre
* cell. "grid": never exits early; every level's cell parity accumulates into
* a running total that picks the final colour.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";
import { repeat } from "./lib/repeat.js";

export function recursive(x, y, params) {
   const { depth = 4, subdivisions = 3, mode = "sierpinski" } = params;
   const mid = Math.floor(subdivisions / 2);

   const result = repeat(
      ({ point, parity }) => {
         const { gx, gy, x: nx, y: ny } = subdivideCell(point.x, point.y, subdivisions);
         if (mode === "sierpinski" && gx === mid && gy === mid) {
            return { stop: true, value: -1 };
         }
         return { stop: false, value: { point: { x: nx, y: ny }, parity: (parity + gx + gy) % 2 } };
      },
      // depth is a slider value, not guaranteed integer; repeat()'s loop bound must be.
      Math.round(depth),
      { point: { x: x / CANVAS.WIDTH, y: y / CANVAS.HEIGHT }, parity: 0 }
   );

   // Never landing on the centre cell means "filled" (same as the base case).
   if (result.stopped) return result.value;
   if (mode === "grid") return result.value.parity === 0 ? 1 : -1;
   return 1;
}
