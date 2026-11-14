/*
========================================
VORONOI GENERATOR
========================================
* Composition: Seed Points -> Distance Field/Partition -> Colour Mapping.
* See src/generators/lib/ — each stage below is a reusable node-shaped primitive.
*/
import { generateSeedPoints } from "./lib/seedPoints.js";
import { nearestPoint } from "./lib/distanceField.js";
import { toneSet } from "./lib/colourMapping.js";

// Seed points are deterministic per (numCells, seed) pair. Cache avoids
// regenerating them every pixel.
const _cache = new Map();

export function voronoi(x, y, params) {
   const { numCells = 20, seed = 1337, tones = "2" } = params;
   const key = `${numCells}|${seed}`;
   if (!_cache.has(key)) _cache.set(key, generateSeedPoints(numCells, seed));
   const points = _cache.get(key);
   const shades = toneSet(tones);

   const { index } = nearestPoint(x, y, points);
   return shades[index % shades.length];
}
