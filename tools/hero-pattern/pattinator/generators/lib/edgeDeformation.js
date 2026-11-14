/*
========================================
EDGE DEFORMATION
========================================
* Maps to the "Edge Deformation" pattern node (docs/nodes/pattern/edge-deformation.md):
* a parametric displacement applied along a boundary so tiles interlock instead
* of tiling as plain rectangles. All bump shapes satisfy b(0) = b(1) = 0 so tile
* corners stay aligned regardless of which shape is chosen.
*/
export function bump(t, type) {
   switch (type) {
      case "wave":   return Math.sin(Math.PI * 2 * t);
      case "zigzag": return t < 0.25 ? 4 * t : t < 0.75 ? 2 - 4 * t : 4 * t - 4;
      case "notch":  return Math.tanh(8 * Math.sin(Math.PI * 2 * t));
      default:       return Math.sin(Math.PI * 2 * t);
   }
}
