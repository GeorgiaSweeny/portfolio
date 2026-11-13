/*
========================================
FOLD (OCTAVES)
========================================
* The generic "sum successively smaller/higher-frequency contributions"
* accumulator used by fractal Brownian motion (see docs/nodes/core/noise.md).
* Extracted so the fold combinator named in
* docs/ALGORITHMIC_COMPOSITION_RESEARCH.md is its own tested unit, not only
* exercised indirectly through noise.js's own property tests.
*
* `sample(frequency, i)` is called once per octave and is expected to return
* a value in a fixed range (e.g. [-1, 1]); foldOctaves handles the
* amplitude/frequency progression and the [-1, 1] renormalisation, exactly
* matching noise.js's original inline loop.
*/
export function foldOctaves(sample, octaves, { persistence = 0.5, lacunarity = 2.0 } = {}) {
   let sum = 0, amplitude = 1, frequency = 1, normalization = 0;
   for (let i = 0; i < octaves; i++) {
      sum           += amplitude * sample(frequency, i);
      normalization += amplitude;
      amplitude     *= persistence;
      frequency     *= lacunarity;
   }
   return sum / normalization;
}
