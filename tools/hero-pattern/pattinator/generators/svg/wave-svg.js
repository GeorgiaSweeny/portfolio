/*
========================================
WAVE — SVG RENDERER
========================================
Wave stripes:  SVG <linearGradient> tiled via <pattern> — one gradient tile
               per sine period, repeating across the canvas height.

Concentric rings: concentric filled circles drawn outside-in, one per pixel
                  of radius, colour sampled from sin(r·frequency). Visually
                  identical to the raster output.

Both match the grayscale mapping in render.js by default (c = (sin+1) ×
127.5, i.e. white at sin=+1, black at sin=-1) — but, like every other
tone-based pattern, `colour1` (light, default white) and `colour2` (dark,
default black) are independently user-editable (added 2026-08-21): every
stop/ring interpolates between those two colours via lib/colourMapping.js's
mixHex rather than the sine value being converted to grey directly, so
setting them to anything else recolours the whole gradient consistently.
*/
import { mixHex } from "../lib/colourMapping.js";

export function waveSvg(width, height, params) {
   const { mode = "wave", frequency = 0.05, colour1 = "#ffffff", colour2 = "#000000" } = params;
   return mode === "rings"
      ? _rings(width, height, frequency, colour1, colour2)
      : _stripes(width, height, frequency, colour1, colour2);
}

// ── Wave stripes ──────────────────────────────────────────────────────────────
// sin(y·f): at y=0, sin=0 → midpoint of colour1/colour2. One period = 2π/f px tall.
// Gradient stops: mid → colour1 → mid → colour2 → mid over one period.

function _stripes(W, H, f, colour1, colour2) {
   const period = r(2 * Math.PI / f);
   const mid = mixHex(colour1, colour2, 0.5);

   const gradient = [
      `<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">`,
      `<stop offset="0%"   stop-color="${mid}"/>`,
      `<stop offset="25%"  stop-color="${colour1}"/>`,
      `<stop offset="50%"  stop-color="${mid}"/>`,
      `<stop offset="75%"  stop-color="${colour2}"/>`,
      `<stop offset="100%" stop-color="${mid}"/>`,
      `</linearGradient>`,
      `<pattern id="wp" x="0" y="0" width="${W}" height="${period}" patternUnits="userSpaceOnUse">`,
      `<rect width="${W}" height="${period}" fill="url(#wg)"/>`,
      `</pattern>`,
   ].join("");

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${gradient}</defs><rect width="${W}" height="${H}" fill="url(#wp)"/></svg>`;
}

// ── Concentric rings ──────────────────────────────────────────────────────────
// Draws filled circles outside-in. Each circle is coloured by sin(r·f),
// interpolated between colour1 (sin=+1) and colour2 (sin=-1).

function _rings(W, H, f, colour1, colour2) {
   const cx   = W / 2;
   const cy   = H / 2;
   const maxR = Math.ceil(Math.sqrt(cx * cx + cy * cy));

   const parts = [];
   for (let rad = maxR; rad >= 0; rad--) {
      const t = (1 - Math.sin(rad * f)) / 2; // 0 -> colour1, 1 -> colour2
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${mixHex(colour1, colour2, t)}"/>`);
   }

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="hidden">${parts.join("")}</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function r(n) { return Math.round(n * 100) / 100; }
