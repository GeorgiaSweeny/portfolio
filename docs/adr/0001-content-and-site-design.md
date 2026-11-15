# 1. Keep content separate from the site design

Date: 14 Nov 2026 · Status: accepted

## Context

The site was redesigned twice in its first week (the launch design on 12 Nov, the "worlds and the
tools that make them" design on 14 Nov). Project text, images and layout hints were mixed together
in `src/projects/*.md`, `src/_data/*.js` and one flat `src/images/` folder: a feature card's
display mode sat next to its one-line pitch, image sizes (`span: wide`) next to alt text. Each
redesign meant editing content to suit the new layout, which risks losing or quietly rewriting it.
More radical redesigns are likely (one long page, a 3D scene, no Projects grid).

## Decision

- Split the repo into **content** (`content/`), which survives every redesign unchanged, and the
  **site design** (everything else), which a redesign replaces.
- Store content as things, not pages: projects (one folder each, with their images and clips),
  artworks, the profile, About, CV entries and the featured choice. YAML and Markdown only, no code.
- Keep layout out of content. The only hint is design-neutral **emphasis** (`emphasis: key`,
  `group:`), which any design may honour or ignore. Feature card modes, row heights and video sizes
  live in the site design's config.
- Every project gets a **pitch** and **showcase media**, so any design that shows projects big and
  alone has what it needs, not only the three featured today.
- Full-resolution **originals** stay outside the repo, one folder per project id; the repo holds
  only web copies made to one rule.
- The build checks content against `CONTENT.md` and fails on unknown, misspelt or missing fields.
  A **coverage check** lists content that appears nowhere on the built site unless the design lists
  it as deliberately not shown.
- Redesigns happen on a branch; retired designs are tagged (`site-design-YYYY-MM`) and screenshotted,
  and can be run again from the tag.

## Consequences

- A redesign can start from a blank `src/` and still has all the content and checks it needs.
- Adding a project means one folder and one file; `npm run images` makes the web copies.
- Templates read plain objects from `src/_lib/content.js` rather than Eleventy collections.
- The restructure itself changed nothing on screen except one intended fix (Oak Tree spread 1 now
  full width like the other spreads); built HTML was compared page by page before and after.
- Old designs aren't kept running; a tag plus `tools/view-old-site.sh` brings one back when needed.
