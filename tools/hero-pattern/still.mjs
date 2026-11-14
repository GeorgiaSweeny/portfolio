// Renders src/assets/hero-still.jpg's source: the hero's no-JS / first-paint frame and the wordmark fill.
// Gilded Cluster (the teal used across the site), at seed 1337, from the same worker code.
// Run: node tools/hero-pattern/still.mjs  →  /tmp/hero-still.raw (1500 × 500 RGBA), then convert to JPEG.
import fs from "node:fs";
globalThis.self = globalThis;
const { PRESETS, drawFrame } = await import("./worker-src.js");
const i = PRESETS.findIndex((p) => p.name === "Gilded Cluster");
const px = drawFrame(i, 1500, 500, 1, 1337);
fs.writeFileSync("/tmp/hero-still.raw", Buffer.from(px.buffer));
console.log("ok", PRESETS[i].name);
