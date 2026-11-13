/*
========================================
SEED (xorshift32)
========================================
* Maps to the "Seed" core node (docs/nodes/node-model-specification.md): initialises
* a pseudo-random number generator from a seed value. Every stochastic generator
* (Perlin permutation table, Voronoi seed points) draws from this one algorithm so
* reproducibility ("same seed -> same output") is a single guarantee, not one
* per-generator promise to keep separately.
*/

// Returns a next() function producing successive uint32s. Same seed -> same
// sequence, forever (determinism is the entire point of a "Seed" node).
export function xorshift32(seed) {
   let state = (seed >>> 0) || 1;
   return function next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state;
   };
}

// next() rescaled to [0, 1).
export function xorshift32Unit(seed) {
   const next = xorshift32(seed);
   return () => next() / 0xffffffff;
}
