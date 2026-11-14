# georgiasweeny.com

Portfolio site, built with [Eleventy](https://www.11ty.dev/) and served by a Cloudflare Worker (static assets + the contact form endpoint).

```sh
npm install
npm start              # local preview at http://localhost:8080, drafts included
npm run build          # production build into _site/ (drafts left out)
npm run build:drafts   # production build with drafts
npm run build:hero     # rebuild the hero pattern worker after editing tools/hero-pattern/
```

## Where things live

| What | Where |
| --- | --- |
| A project (card + page) | `src/projects/<slug>.md`: front matter only; page at `/projects/<slug>/` |
| Disciplines (filter pages `/projects/<slug>/`) | `src/_data/disciplineList.js` |
| Status tag, positioning line, social links, Turnstile key | `src/_data/site.js` |
| Shared profile (About + CV + PDF CV) | `src/_data/profile.js` |
| About: stats, skills, timeline | `src/_data/about.js` |
| Public CV | `src/_data/cv.js`; drop the PDF at `src/static/cv/georgia-sweeny-cv.pdf` and the Download PDF buttons appear |
| Personal Work artworks | `src/_data/artworks.js` |
| Image masters | `src/images/` (one large file per image; the build makes AVIF/WebP/JPEG at several widths) |
| Styles / script | `src/css/site.css`, `src/js/site.js` |
| Hero pattern (Home) | `src/js/hero-pattern.js` (blends between patterns, follows the cursor, random start and seed per visit); frames drawn by `src/js/hero-pattern-worker.js`, built from `tools/hero-pattern/worker-src.js` and Pattinator's own generators in `tools/hero-pattern/pattinator/`. The nine patterns (Georgia's gallery presets, random → rule-based) are `PRESETS` in `worker-src.js`; if you change how many there are, change `N` in `hero-pattern.js` too. No-JS still and wordmark fill: `src/assets/hero-still.jpg` (Gilded Cluster, `node tools/hero-pattern/still.mjs`) |
| Contact page (form) | `src/contact.njk` + `src/_includes/partials/contact.njk`; every other page ends with `partials/contact-band.njk` |
| Security headers | `src/static/_headers` |
| Contact form backend | `worker/index.js`, configured in `wrangler.jsonc` |
| Show Personal Work to visitors | `showPersonalWork: true` in `src/_data/site.js` |

### Adding a project

Copy an existing file in `src/projects/`, rename it (the file name is the URL), and fill in the
front matter. `draft: true` keeps it off the live site.

Home shows exactly three featured projects as feature cards: give a project `featured: <1-3>` and a
`feature:` block (`mode`: `bleed` for full-screen video/image, `range` for a drifting row of images,
`stage` for a smaller clip beside the words; `line`: its one line; `video`/`poster` or `images`).

### Images

Put the largest sensible version (about 2400px wide, JPEG) in `src/images/` and refer to it by
file name. Never crop gallery images to fit: galleries match image heights instead (`imgH` on a
gallery sets the row height). Card images are cropped 4:3, so keep the subject centred.

© Georgia Sweeny. All artwork and designs in this repository are my own work and may not be
reproduced without permission.
