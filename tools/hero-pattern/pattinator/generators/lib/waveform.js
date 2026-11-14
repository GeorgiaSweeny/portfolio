/*
========================================
WAVEFORM
========================================
* Maps to the "Waveform" computation node (docs/nodes/computation/waveform.md):
* a periodic function applied to a scalar (a distance, a coordinate, ...),
* turning a monotonic field into a repeating one. The generic case of
* wave.js's bare `Math.sin(y * frequency)` — extracted so any generator that
* needs "turn this scalar field into rings/stripes" can reuse the same node
* instead of re-inlining Math.sin.
*/

// Sine wave over a scalar input. phase shifts the waveform; frequency controls
// how quickly it repeats as the input grows.
export function sineWave(value, frequency, phase = 0) {
   return Math.sin(value * frequency + phase);
}
