import fs from "node:fs";
import design from "./design.js";

// Switches for things that aren't ready for visitors yet.
// Local previews (`npm start`, `npm run build:drafts`) always show everything.
const preview = process.env.ELEVENTY_RUN_MODE === "serve" || process.env.SHOW_DRAFTS === "1";

export default {
  preview,
  // Personal Work page, nav link and filter: turn on in design.js (`showPersonalWork: true`).
  personalWork: preview || design.showPersonalWork === true,
  // Download PDF buttons appear by themselves once content/cv.pdf is in place.
  cvPdf: fs.existsSync("content/cv.pdf"),
};
