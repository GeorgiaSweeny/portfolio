# georgiasweeny.com

Portfolio site, built with [Eleventy](https://www.11ty.dev/) and served by a Cloudflare Worker (static assets + the contact form endpoint).

```sh
npm install
npm start              # local preview at http://localhost:8080, drafts included
npm run build          # production build into _site/ (drafts left out)
npm run build:drafts   # production build with drafts
npm run build:hero     # rebuild the hero pattern worker after editing tools/hero-pattern/
npm run check          # build, then list any content that appears nowhere on the site
npm run images -- <id> # make web copies of a project's originals (see ADDING-CONTENT.md)
```

## Content and site design

`content/` holds the **content**: projects (one folder each, with their images and clips), the
profile, About, CV, artworks and the three featured projects. Everything else is the **site
design**, which a redesign replaces.

- [CONTENT.md](CONTENT.md): every content field, what it means and whether it's required.
- [ADDING-CONTENT.md](ADDING-CONTENT.md): adding a project, the web copy rules for images and clips.
- [REDESIGN.md](REDESIGN.md): how redesigns work, the checklist and the site design log.
- [docs/adr/](docs/adr/): why it's set up this way.

## Where the site design lives

| What | Where |
| --- | --- |
| Pages and templates | `src/*.njk`, `src/_includes/`; project pages from `src/project-pages.njk` |
| Reading and checking content | `src/_lib/content.js` (templates get `projects`, `featured`, `profile`, `about`, `cv`, `artworks`) |
| Site settings and how this design shows things | `src/_data/design.js` (domain, Turnstile key, analytics, Personal Work switch, feature card modes, gallery row heights) |
| Disciplines (filter pages `/projects/<slug>/`) | `src/_data/disciplineList.js` |
| Content this design leaves out on purpose | `src/not-shown.yaml` |
| Styles / script | `src/css/site.css`, `src/js/site.js` |
| Hero pattern (Home) | `src/js/hero-pattern.js` (blends between patterns, stirred by the cursor, random start and seed per visit); frames drawn by `src/js/hero-pattern-worker.js`, built from `tools/hero-pattern/worker-src.js` and Pattinator's own generators in `tools/hero-pattern/pattinator/`. The patterns (Georgia's gallery presets, random → rule-based) are `PRESETS` in `worker-src.js`; if you change how many there are, change `N` in `hero-pattern.js` too. No-JS still and wordmark fill: `src/assets/hero-still.jpg` (Gilded Cluster, `node tools/hero-pattern/still.mjs`) |
| Default link-preview image | `src/_images/pat-banner.jpg` |
| Contact page (form) | `src/contact.njk` + `src/_includes/partials/contact.njk`; every other page ends with `partials/contact-band.njk` |
| Security headers | `src/static/_headers` |
| Contact form backend | `worker/index.js`, configured in `wrangler.jsonc` |
| Running an old version | `tools/view-old-site.sh <tag>` |

© Georgia Sweeny. All artwork and designs in this repository are my own work and may not be
reproduced without permission.
