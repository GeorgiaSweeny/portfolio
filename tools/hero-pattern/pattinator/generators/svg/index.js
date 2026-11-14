/*
========================================
SVG GENERATOR LOOKUP TABLE
========================================
Maps generator name → fn(width, height, params) → SVG string.
Only generators with a native vector representation are listed here.
*/

import { gridSvg }      from "./grid-svg.js";
import { voronoiSvg }   from "./voronoi-svg.js";
import { waveSvg }      from "./wave-svg.js";
import { recursiveSvg } from "./recursive-svg.js";
import { escherSvg }    from "./escher-svg.js";
import { islamicSvg }   from "./islamic-svg.js";

export const SVG_GENERATORS = {
   grid:      gridSvg,
   voronoi:   voronoiSvg,
   wave:      waveSvg,
   recursive: recursiveSvg,
   escher:    escherSvg,
   islamic:   islamicSvg,
};
