import fs from "node:fs";
import site from "./site.js";

// Switches for things that aren't ready for visitors yet.
// Local previews (`npm start`, `npm run build:drafts`) always show everything.
const preview = process.env.ELEVENTY_RUN_MODE === "serve" || process.env.SHOW_DRAFTS === "1";

export default {
  preview,
  // Personal Work page, nav link and filter: turn on in site.js (`showPersonalWork: true`).
  personalWork: preview || site.showPersonalWork === true,
  // Download PDF buttons appear by themselves once the PDF is in place.
  cvPdf: fs.existsSync(`src/static${site.cvPdf}`),
};
