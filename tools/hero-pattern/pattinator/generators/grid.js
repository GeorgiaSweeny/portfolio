/*
========================================
GRID TESSELLATION GENERATOR
========================================
* Composition: Base Geometry (shape, tile size) -> Lattice Index -> Colour Mapping.
* See src/generators/lib/latticeIndex.js — each shape's index computation is a
* reusable node-shaped primitive; docs/nodes/computation/lattice-index.md explains
* why this is its own concept rather than Partition or Rotate+Translate+Repeat.
*/
import { toneSet } from "./lib/colourMapping.js";
import {
   squareIndex, triangleIndex, hexagonIndex, brickIndex, diamondIndex,
} from "./lib/latticeIndex.js";

// Pure grid tessellation. All shape-specific arithmetic lives in lib/latticeIndex.js.
export function grid(x, y, params) {
   const { shape = "square", tileSize = 40, tones = "2" } = params;
   const shades = toneSet(tones);
   const n = shades.length;
   switch (shape) {
      case "square":   return shades[squareIndex(x, y, tileSize, n)];
      case "triangle": return shades[triangleIndex(x, y, tileSize, n)];
      case "hexagon":  return shades[hexagonIndex(x, y, tileSize, n)];
      case "brick":    return shades[brickIndex(x, y, tileSize, n)];
      case "diamond":  return shades[diamondIndex(x, y, tileSize, n)];
      default:         return 0;
   }
}
