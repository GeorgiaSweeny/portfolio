/*
========================================
RECURSIVE NOISE — PERLIN-PERTURBED SIERPINSKI CARPET (HYBRID)
========================================
* Composition: recursive.js's "sierpinski" mode, but each level's coordinates
* are domain-warped by Noise before the centre-cell test runs. See
* docs/generators/recursive-noise.md.
*
* Each level has its own independent warp strength AND texture — amplitude1,
* scale1, octaves1 control level 0's warp; amplitude2/scale2/octaves2 level
* 1's; and so on up to level 6 (patternRegistry.js's `depth` maxes out at 6)
* — so every Noise node in the workflow graph is a genuinely free, fully
* independent control, not one shared value applied everywhere. `seed` alone
* stays shared: a per-level seed wouldn't add anything once each level
* already has its own independent scale/octaves texture.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";
import { repeat } from "./lib/repeat.js";
import { noise } from "./noise.js";

// Matches patternRegistry.js's `depth` param (map: [1, 6]) — the most
// levels a Noise node can ever exist for.
export const MAX_LEVELS = 6;

export function recursiveNoise(x, y, params) {
   const { depth = 4, seed = 1337 } = params;
   const subdivisions = 3; // fixed — the classic Sierpinski carpet's own split
   const mid = Math.floor(subdivisions / 2);
   const roundedDepth = Math.round(depth);

   const result = repeat(
      ({ point }, i) => {
         let px = point.x, py = point.y;
         // Level i's own independent strength AND texture — amplitudeN,
         // scaleN, octavesN for level N - 1 — not derived from any other
         // level's own values.
         const levelAmplitude = Number(params[`amplitude${i + 1}`]) || 0;
         const levelScale = Number(params[`scale${i + 1}`]) || 0.01;
         const levelOctaves = Number(params[`octaves${i + 1}`]) || 2;

         if (levelAmplitude !== 0) {
            // Fresh noise sample per level at that level's own local
            // coordinates; two independent samples (offset in x) give an
            // (nx, ny) warp vector.
            const nx = noise(px * CANVAS.WIDTH, py * CANVAS.HEIGHT, {
               scale: levelScale, seed, octaves: levelOctaves,
            });
            const ny = noise(px * CANVAS.WIDTH + 999, py * CANVAS.HEIGHT + 999, {
               scale: levelScale, seed: seed + 1, octaves: levelOctaves,
            });
            px += levelAmplitude * nx;
            py += levelAmplitude * ny;
            // Wrap back into [0, 1): subdivideCell expects a unit-square
            // point, and JS's `%` keeps the sign of its left operand, so a
            // negative warp needs a true modulo, not a bare remainder.
            px = ((px % 1) + 1) % 1;
            py = ((py % 1) + 1) % 1;
         }

         const { gx, gy, x: nx2, y: ny2 } = subdivideCell(px, py, subdivisions);
         if (gx === mid && gy === mid) {
            return { stop: true, value: -1 };
         }
         return { stop: false, value: { point: { x: nx2, y: ny2 } } };
      },
      // See recursive.js: depth arrives from a continuous archetype slider,
      // so it isn't guaranteed to be an integer; repeat()'s loop bound must be.
      roundedDepth,
      { point: { x: x / CANVAS.WIDTH, y: y / CANVAS.HEIGHT } }
   );

   // Reaching depth iterations without ever landing on the excluded centre
   // cell is the same "not removed" result recursive.js's base case returns.
   return result.stopped ? result.value : 1;
}
