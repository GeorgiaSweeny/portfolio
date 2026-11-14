/*
========================================
INDEX - GENERATOR LOOKUP TABLE
========================================
*/
import { noise }          from "./noise.js";
import { grid }           from "./grid.js";
import { wave }           from "./wave.js";
import { voronoi }        from "./voronoi.js";
import { recursive }      from "./recursive.js";
import { escher }         from "./escher.js";
import { islamic }        from "./islamic.js";
import { recursiveNoise } from "./recursiveNoise.js";
import { voronoiIslamic } from "./voronoiIslamic.js";
import { voronoiIslamicV2 } from "./voronoiIslamicV2.js";

// Registry: generator name (string) → pure function (x, y, params) → [-1, 1]
export const GENERATORS = {
   noise, grid, wave, voronoi, recursive, escher, islamic, recursiveNoise, voronoiIslamic, voronoiIslamicV2,
};
