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
npm run preview:phone  # production build, uploaded to the phone preview (see below)
```

## Working locally, then "go live"

Changes are made and checked on a Mac and pushed only when Georgia says "go live", so Cloudflare
builds once per release rather than once per edit.

1. **Local preview.** In Terminal, in this folder, run `npm start` and leave it running (the first
   time, run `npm ci` first; needs Node.js 20 or newer). The site is at http://localhost:8080 and
   rebuilds itself whenever a file changes. It shows drafts and the hidden Personal Work page,
   which the live site doesn't.
2. **Edit and commit on `redesign`, without pushing.** Check each change on localhost.
3. **Phone preview, when wanted.** Stop `npm start` (Ctrl+C), run `npm run preview:phone`, then
   start `npm start` again. It builds the site as the live site would be (no drafts) and uploads
   it to https://redesign-portfolio.georgia-sweeny.workers.dev/ (the preview is named after the
   current branch). The first time, run `npx wrangler login` and approve it in the browser.
   Stopping `npm start` first matters: it writes draft pages into `_site/`. The script clears `_site/` with retries, because macOS can recreate a hidden `.DS_Store` there while it is being deleted.
4. **Go live.** `git checkout main && git merge --ff-only redesign && git push`, then
   `git checkout redesign && git push`. Only the `main` push builds.

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

## Builds and deploys

Cloudflare Workers Builds builds every push to `main` and deploys the live site
(`npx wrangler deploy`). Builds for other branches are switched off (Settings → Builds → Previews
Base → "Builds for Preview branches"), so pushing `redesign` builds nothing; the phone preview is
uploaded by hand (above). Build cache is on in the dashboard.

- **Image cache.** Eleventy Image writes the encoded images to `.cache/img/`, which the build cache
  keeps between builds, and copies them into `_site/img/` afterwards, so only new or changed
  images are encoded. A normal build takes about 2 minutes, plus any wait for a free build
  machine.
- **Full rebuilds** (every image encoded again, 6–15 minutes in Nov 2026) happen when
  `package-lock.json` changes, after 7 days with no builds (Cloudflare clears the cache), or after
  "Clear Cache" in the dashboard.
- **Builds stop after 20 minutes.** A build that times out saves no cache, so the next one times
  out too, and so does every one after it. The site that's already live stays up.

### If a Cloudflare build times out

Build on a Mac, where there's no time limit, and deploy from there. You need Node.js 20 or newer
(`node -v`; get it from nodejs.org).

```sh
cd ~/Website\ Portfolio/site
git fetch && git checkout main && git pull   # or redesign, for the preview
npm ci
npm run build                                # 5–10 minutes the first time; .cache/ makes later builds quick
npx wrangler login                           # once: approve in the browser
npx wrangler deploy                          # live site (from main)
npx wrangler preview                         # or: the phone preview, named after the current branch
git checkout redesign
```

`wrangler.jsonc` sets `keep_vars`, and deploys never remove secrets, so the contact form's
settings in the dashboard are kept. Pushes keep failing on Cloudflare until full rebuilds fit
in 20 minutes again, so deploy each one this way until then, and then move the image cache
somewhere that doesn't expire (planned: an R2 bucket; see the handoff).

© Georgia Sweeny. All artwork and designs in this repository are my own work and may not be
reproduced without permission.
