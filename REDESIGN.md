# Redesigning the site

A redesign replaces the **site design** (everything outside `content/`) and never changes the
content. Why: [docs/adr/0001-content-and-site-design.md](docs/adr/0001-content-and-site-design.md).

Anything goes: a new site design may change which pages exist, their layouts, styles, fonts and
scripts, or drop the Projects grid altogether. What it may not do is lose content. Each site design
is named by the month it goes live ("the Nov 2026 site design").

## What belongs to the site design

- Pages and templates (`src/*.njk`, `src/_includes/`), styles, scripts, fonts, icons.
- `src/_data/design.js`: site settings (domain, Turnstile key, analytics token, the Personal Work
  switch) and how this design shows things (feature card modes, gallery row heights, small videos).
- `src/_lib/content.js`: reads `content/` and checks it. A new design may rewrite it but must keep
  every check in [CONTENT.md](CONTENT.md).
- The hero pattern (presets, shader settings, `tools/hero-pattern/`), the wordmark still and the
  retired banner images.
- Wording that only makes sense in that design, such as the hero caption about stirring the
  pattern, page headings and ledes.
- `src/not-shown.yaml`: content this design deliberately leaves out, each with a reason.

## Checklist

1. **Tag the outgoing site design** on `main`: `git tag site-design-YYYY-MM` (the month it went
   live) and push the tag. Take screenshots of every page (desktop and phone) into
   `../archive/site-design-YYYY-MM/`. Add it to the log below.
2. **Work on the `redesign` branch.** Every push builds the branch preview.
3. **Build against `CONTENT.md`.** Use every field a design needs from content; put design choices
   in the design's own config, never in `content/`. If the design needs a new kind of content (a new
   field), add it to `CONTENT.md` and the checks first, written so any design could use it.
4. **Coverage check**: `npm run check`. Everything in `content/` must appear on the built site or be
   listed in `src/not-shown.yaml` with a reason.
5. **Compare** with the old design when useful: `tools/view-old-site.sh site-design-YYYY-MM` runs a
   tag locally at http://localhost:8081 (with that day's content).
6. **Check the preview** on phone and laptop: every page, every link.
7. **Go live** only with Georgia's go-ahead: fast-forward `main` to `redesign`, push, check
   https://georgiasweeny.com.

Old site designs are not kept runnable side by side; the tags are enough.

## Site design log

| Site design | Tag | Live | Screenshots |
| --- | --- | --- | --- |
| Launch design (pattern bands, coral) | not tagged | 12 Nov 2026 – 14 Nov 2026 | `archive/` |
| Nov 2026 site design ("worlds and the tools that make them": hero pattern, dark/paper, gold) | `pre-restructure` marks it before content moved to `content/`; tag `site-design-2026-11` when it's retired | 14 Nov 2026 – | |
