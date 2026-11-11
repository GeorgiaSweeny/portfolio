# georgiasweeny.com

Portfolio site. Static HTML, no build step, no dependencies, no framework.
Published via GitHub Pages from the `main` branch root — this repo *is* the
live site.

## Structure

    index.html              home: hero banner, profile, featured projects
    css/style.css           one shared stylesheet for every page
    img/                    all site images, 800px wide, JPEG q72
    projects/
      index.html            all projects
      <slug>/index.html     one page per project
    favicon.ico
    apple-touch-icon.png
    CNAME                   custom domain — GitHub Pages needs this, don't delete

See `CLAUDE.md` for full content/design conventions (ignored by git, so it
stays local — it's a working brief, not site content).

## Editing

Everything is plain HTML/CSS, no build step:

1. Clone the repo, edit files directly, open `index.html` in a browser to
   preview (works straight from `file://`, no server needed).
2. Commit and push to `main` — GitHub Pages redeploys in about a minute.

### Adding an image

1. Resize to 800px wide, save as JPEG at quality ~72, into `img/` with a
   short slug name matching the project (e.g. `sun-medina.jpg`).
2. Copy an existing `<figure>` block on the relevant page, update the
   filename, `alt` text, caption, and `width`/`height` to the real pixel size.
3. See the gallery sizing rules in `CLAUDE.md` if the image needs
   `class="wide"`/`class="pair"` or a different `--img-h`.

### Adding a project

1. Duplicate an existing folder under `projects/<slug>/`.
2. Update its `index.html`, add a card for it on the home page and/or
   `projects/index.html`.

## Hosting

GitHub Pages, custom domain `georgiasweeny.com` (DNS already points at
GitHub). Keep `CNAME` and enforce-HTTPS on in the repo's Pages settings.
