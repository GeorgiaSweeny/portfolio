/*
========================================
REPEAT (POWER)
========================================
* The generic "apply the same step to its own output, up to n times, with an
* early exit" combinator behind recursive self-similar structures (see
* docs/nodes/pattern/subdivide.md). Extracted so the repeat/power combinator
* named in docs/ALGORITHMIC_COMPOSITION_RESEARCH.md is its own tested unit,
* not only exercised indirectly through recursive.js's own property tests.
*
* `step(value, i)` returns either `{ stop: true, value }` (an early exit —
* e.g. "this cell is excluded") or `{ stop: false, value }` (the remapped
* value to feed into the next iteration). If no iteration stops within `n`
* steps, `repeat` reports that too, so the caller can supply its own
* "completed without stopping" result.
*/
export function repeat(step, n, initialValue) {
   let value = initialValue;
   for (let i = 0; i < n; i++) {
      const result = step(value, i);
      if (result.stop) return { stopped: true, value: result.value };
      value = result.value;
   }
   return { stopped: false, value };
}
