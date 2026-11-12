# georgiasweeny.com

Portfolio site, built with [Eleventy](https://www.11ty.dev/) and served by Cloudflare Pages.

```sh
npm install
npm start              # local preview at http://localhost:8080, drafts included
npm run build          # production build into _site/ (drafts left out)
npm run build:drafts   # production build with drafts
```

## Where things live

| What | Where |
| --- | --- |
| A project (card + page) | `src/projects/<slug>.md`: front matter only; page at `/projects/<slug>/` |
| Disciplines (filter pages `/projects/<slug>/`) | `src/_data/disciplineList.js` |
| Status tag, positioning line, social links, Turnstile key | `src/_data/site.js` |
| Shared profile (About + CV + PDF CV) | `src/_data/profile.js` |
| About: stats, skills, timeline | `src/_data/about.js` |
| Public CV | `src/_data/cv.js` (+ PDF at `src/static/cv/georgia-sweeny-cv.pdf`) |
| Personal Work artworks | `src/_data/artworks.js` |
| Image masters | `src/images/` (one large file per image; the build makes AVIF/WebP/JPEG at several widths) |
| Styles / script | `src/css/site.css`, `src/js/site.js` |
| Security headers | `src/static/_headers` |
| Contact form backend | `functions/api/contact.js` (Cloudflare Pages Function) |

### Adding a project

Copy an existing file in `src/projects/`, rename it (the file name is the URL), and fill in the
front matter. `featured: <n>` puts it on Home in that position; `flagship: true` makes it the big
card. `draft: true` keeps it off the live site.

### Images

Put the largest sensible version (about 2400px wide, JPEG) in `src/images/` and refer to it by
file name. Never crop gallery images to fit: galleries match image heights instead (`imgH` on a
gallery sets the row height). Card images are cropped square, so keep the subject centred.

© Georgia Sweeny. All artwork and designs in this repository are my own work and may not be
reproduced without permission.
