// Renders src/assets/hero-still.png: the hero pattern's no-JS / first-paint frame, from the same worker code.
// Run: node tools/hero-pattern/still.mjs  (then the PNG is converted to JPEG)
import fs from "node:fs";
const W = 1600, H = 520, T = 0.62;
let out;
globalThis.self = globalThis; globalThis.postMessage = (m) => { out = m; };
await import("./worker-src.js");
self.onmessage({ data: { w: W, h: H, unit: 100, order: [T] } });
fs.writeFileSync("/tmp/hero-still.raw", Buffer.from(out.px.buffer));
console.log("ok", W, H);
