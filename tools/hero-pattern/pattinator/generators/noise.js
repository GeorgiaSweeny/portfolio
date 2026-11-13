
/*
========================================
NOISE GENERATOR
========================================
* Composition: Seed -> Noise, where Noise's fBm octave loop is a Fold
* (src/generators/lib/fold.js) over repeated Perlin samples at increasing
* frequency/decreasing amplitude. mode "ridge" folds the fBm value again,
* through 1 - 2|raw|, to turn its zero-crossings into sharp ridgelines
* instead of smooth hills — see docs/nodes/core/noise.md.
*/
import { Perlin } from "../patternSystems/noiseLib/perlinNoise.js";
import { foldOctaves } from "./lib/fold.js";

// Seed-keyed cache so we never rebuild the permutation table mid-frame.
const _perlinCache = new Map();
function getPerlin(seed) {
   if (!_perlinCache.has(seed)) _perlinCache.set(seed, new Perlin(seed));
   return _perlinCache.get(seed);
}

export function noise(x, y, params) {
   const {
      scale       = 0.01,
      seed        = 1337,
      octaves     = 1,
      lacunarity  = 2.0,
      persistence = 0.5,
      mode        = "standard",
   } = params;

   const perlin = getPerlin(seed);

   const raw = foldOctaves(
      (frequency) => perlin.noise2D(x * scale * frequency, y * scale * frequency),
      octaves,
      { persistence, lacunarity }
   );

   return mode === "ridge" ? 1 - 2 * Math.abs(raw) : raw;
}
