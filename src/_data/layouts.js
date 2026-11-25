// Project page layouts for the Nov 2026 site design (settled 25 Nov 2026; see
// docs/adr and the project docs' layout-types-2026-11.md).
//
// Three levels:
//   1. sections: reusable building blocks. A gallery or video block in a project's index.md
//      names its section (`section: concept-art`); the section gives its standard heading and
//      its default row style. A block's own `heading:` replaces the standard heading.
//   2. presets: the usual sections for each kind of project, in order (`layout: film`).
//      A starting point: a project may borrow sections from any preset, split one into
//      several blocks, reorder, rename or leave sections out.
//   3. per-project detail: design.js galleryHeights / galleryColumns / openings, by heading.
//
// Row styles:
//   rows      justified rows of mixed shapes (the default row height)
//   small     justified rows, smaller (many small items: maps, thumbnails, outputs)
//   showcase  one item per row, large (finished spreads, final renders)
//   grid      an even grid, `cols` per row (same-shape runs: stages, the range, storyboards)
//   clip      a looping clip beside the finished piece (tall rows)
//   video     a YouTube video
//
// Section keys are content (they survive a redesign); headings and styles are site design.
export const styles = {
  rows: { height: 450 },
  small: { height: 300 },
  showcase: { showcase: true },
  grid: {},
  clip: { height: 850 },
  video: {},
};

export const sections = {
  // the idea
  "initial-concept": { heading: "Initial Concept", style: "rows" },
  "concept": { heading: "Concept", style: "rows" },
  "concept-art": { heading: "Concept Art", style: "rows" },
  "characters": { heading: "Characters", style: "rows" },
  "environments": { heading: "Environments", style: "rows" },
  "props": { heading: "Props", style: "rows" },
  "references": { heading: "References", style: "small" },
  "storyboards": { heading: "Storyboards and Animatic", style: "rows" },
  // making it
  "production": { heading: "Production", style: "rows" },
  "story": { heading: "Story", style: "rows" },
  "set": { heading: "Set and Environment", style: "rows" },
  "lighting": { heading: "Lighting", style: "rows" },
  "models": { heading: "Models", style: "rows" },
  "vfx": { heading: "VFX", style: "rows" },
  "sfx": { heading: "Sound", style: "rows" },
  "behind-the-scenes": { heading: "Behind the Scenes", style: "small" },
  "development": { heading: "Development", style: "rows" },
  "research": { heading: "Research", style: "rows" },
  // the result
  "final": { heading: "Final Renders", style: "rows" },
  "stills": { heading: "Stills from the Film", style: "rows" },
  "finished": { heading: "The Finished Piece", style: "rows" },
  // games
  "signature-system": { heading: "Signature System", style: "rows" },
  "level-design": { heading: "Level Design", style: "small" },
  "systems": { heading: "Systems and UI", style: "rows" },
  // software and interactive
  "what-it-does": { heading: "What It Does", style: "rows" },
  "inside-the-tool": { heading: "Inside the Tool", style: "rows" },
  // books
  "every-page": { heading: "Every Page", style: "rows" }, // spreads marked key get a row each
  "artwork-without-text": { heading: "The Artwork, Without Text", style: "rows" },
  "sketches": { heading: "Sketches and Development", style: "rows" },
  // collections and single pieces
  "range": { heading: "The Range", style: "grid", cols: 4 },
  "stages": { heading: "Stage by Stage", style: "grid", cols: 5 },
  "sketch-to-final": { heading: "Sketch to Final", style: "rows" },
  "beyond-the-studio": { heading: "Beyond the Studio", style: "rows" },
  "in-the-works": { heading: "In the Works", style: "grid", cols: 5 },
  // any project
  "video": { heading: "Video", style: "video" },
};

export const presets = {
  film: { label: "Film & Animation", sections: ["initial-concept", "concept-art", "characters", "environments", "props", "references", "storyboards", "production", "story", "set", "lighting", "models", "vfx", "sfx", "final", "stills", "behind-the-scenes", "video"] },
  asset: { label: "3D Asset & Making", sections: ["concept", "production", "finished", "video"] },
  game: { label: "Game", sections: ["signature-system", "video", "level-design", "systems", "development"] },
  software: { label: "Software & Interactive", sections: ["what-it-does", "inside-the-tool", "video", "development", "research"] },
  book: { label: "Book & Illustrated Pages", sections: ["every-page", "artwork-without-text", "sketches"] },
  collection: { label: "Collection", sections: ["range", "beyond-the-studio", "stages", "in-the-works"] },
  piece: { label: "Single Piece", sections: ["finished", "sketch-to-final", "beyond-the-studio"] },
};

export default { styles, sections, presets };
