/*
========================================
PERLIN NOISE ALGORITHM
========================================
* Adapted from Ken Perlin's "Improving Noise" (SIGGRAPH 2002) reference Java
* implementation, and Abdelrahman Said's 2D C port (which this class's
* axis-aligned 4-gradient simplification and permutation-table shuffle follow).
* See docs/generators/noise.md for the algorithm and fBm layering it implements.
*/
import { xorshift32 } from "../../generators/lib/rng.js";

export class Perlin {
   constructor(seed = 1337) {
      this.PERMUTATION_COUNT = 256;
      this.perm = new Uint32Array(this.PERMUTATION_COUNT * 2);

      this.init(seed);
   }

   //Fisher-Yates shuffle
   shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
         const j = this.randomU32() % (i + 1);

         const tmp = array[i];
         array[i] = array[j];
         array[j] = tmp;
      }
   }

   //Initialize permutation table
   init(seed = 1337) {
      // Seed node (src/generators/lib/rng.js): one xorshift32 implementation
      // shared with Voronoi's seed points, rather than a second copy here.
      this.randomU32 = xorshift32(seed);

      const tmp = new Uint32Array(this.PERMUTATION_COUNT);

      for (let i = 0; i < this.PERMUTATION_COUNT; i++) {
         tmp[i] = i;
      }

      this.shuffle(tmp);

      for (let i = 0; i < this.PERMUTATION_COUNT; i++) {
         this.perm[i] = tmp[i];
         this.perm[i + this.PERMUTATION_COUNT] = tmp[i];
      }
   }

   //Fade function - Perlin's smoothstep-like quintic curve
   fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
   }

   lerp(t, a, b) {
      return a + t * (b - a);
   }

   /*
   Corresponds to Abdelrahman Said's simplfied ver of gradients:
   ( 1, 0)
   (-1, 0)
   ( 0, 1)
   ( 0,-1)
   */
   gradient2D(hash, x, y) {
      switch (hash & 3) {
         case 0: return x;
         case 1: return -x;
         case 2: return y;
         default: return -y;
      }
   }

   // Perlin Noise 2D
   noise2D(x, y) {
      const fx = Math.floor(x);
      const fy = Math.floor(y);

      const xu = fx & 255;
      const yu = fy & 255;

      x -= fx;
      y -= fy;

      const a = this.perm[xu] + yu;
      const b = this.perm[xu + 1] + yu;

      const u = this.fade(x);
      const v = this.fade(y);

      const g00 = this.gradient2D(this.perm[a], x, y);
      const g10 = this.gradient2D(this.perm[b], x - 1, y);
      const g01 = this.gradient2D(this.perm[a + 1], x, y - 1);
      const g11 = this.gradient2D(this.perm[b + 1], x - 1, y - 1);

      return this.lerp(
         v,
         this.lerp(u, g00, g10),
         this.lerp(u, g01, g11)
      );
   }

   reseed(seed) {
   this.init(seed);
   }
}
