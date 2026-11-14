/*
========================================
WAVE GENERATOR
========================================
* "rings" mode composes a Distance Field (distance to the workspace centre — see
* src/generators/lib/distanceField.js) with a Waveform (src/generators/lib/waveform.js);
* "wave" mode applies the same Waveform directly to the y coordinate, with no
* distance computation to decompose further.
*/

import { CANVAS } from "../config.js";
import { distanceToPoint } from "./lib/distanceField.js";
import { sineWave } from "./lib/waveform.js";

export function wave(x, y, params) {
   const { frequency = 0.05, mode = "wave" } = params;

   if (mode === "rings") {
      const radius = distanceToPoint(x, y, CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2);
      return sineWave(radius, frequency);
   }

   return sineWave(y, frequency);
}
