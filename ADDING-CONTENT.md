# Adding content

Step by step. Every field is explained in [CONTENT.md](CONTENT.md).

Folders, next to each other:

```
Website Portfolio/
  site/        this repo: content/ + the site design; the only thing deployed
  originals/   full-resolution files, one folder per project id; never in git
    _not-on-site/   material not (yet) on the site
  archive/     retired site design screenshots and old versions
  tools/       helper scripts that aren't part of the site
```

## A new project

1. **Pick the id**: lowercase words joined by hyphens, e.g. `moroccan-lamp`. It becomes the link
   (`/projects/moroccan-lamp/`) and the folder name in both `originals/` and `content/projects/`.
2. **Gather the originals** in `originals/<id>/`: scans, renders, exports, video masters.
3. **Make web copies** of the images (rules below):
   ```sh
   npm run images -- <id>            # lists each original with a suggested name; writes nothing
   npm run images -- <id> --write    # makes the copies in content/projects/<id>/
   npm run images -- <id> --write "IMG_0412.jpg=storyboard-market"   # choose a name
   ```
4. **Write `content/projects/<id>/index.md`**: copy another project's file as a start. Add
   `draft: true` until it's ready to go live. Every project needs an outcome and an intro,
   each doing a different job:
   - **outcome**: what came of it (results), shown on project cards and feature cards;
   - **intro**: the context: the brief, what Georgia did, how it went.
5. **Check**: `npm run check` builds the site and runs the coverage check. `npm start` previews it at
   http://localhost:8080 (drafts included).
6. **Publish**: push to the `redesign` branch, check the branch preview, then go live
   (fast-forward `main`). Remove `draft: true` when it's ready.

To feature a project on Home, put its id in `content/featured.yaml` (exactly three, in order) and
make sure it has `showcase` media. Its feature card shows the outcome, or `featureText` if you
want a different line there.

## Web copy rules

Images
- JPEG quality 82, sRGB, longest edge 2400px, metadata stripped (no camera or location data).
- PNG only for images that need transparency.
- Never crop gallery images to fit a layout; card images are cropped 4:3 by the site, so keep the
  subject central in the `cardImage`.
- `npm run images` applies all of this. Hand exports (from Photoshop, Procreate, etc.) follow the
  same rules.

Clips (for showcase media)
- MP4, H.264, silent, at most 1080p, a loop under about 15 seconds. Long films go on YouTube and are
  added as a `video` block.
- From a source video, e.g. 10 seconds starting at 0:00:
  ```sh
  ffmpeg -ss 0 -t 10 -i "master.mov" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 23 \
    -preset veryfast -pix_fmt yuv420p -movflags +faststart clip.mp4
  ```
  Keep the master in `originals/<id>/` and put `clip.mp4` in `content/projects/<id>/`. For its
  `poster`, save a still into the originals (`ffmpeg -ss 0 -i clip.mp4 -frames:v 1 -q:v 2
  ../originals/<id>/clip.jpg`) and make its web copy with `npm run images -- <id> --write "clip.jpg=clip"`.

Names
- Short, lowercase, hyphenated, descriptive; no project prefix (the folder says which project):
  `capturing-the-sun/storyboard-market.jpg`, not `sun-sb-market.jpg`.

Text
- Alt text on every image: what it shows, for someone who can't see it.
- Tools: only the tools Georgia used herself.
- No email address, phone number or street address anywhere in content.

## Everything else

| To change | Edit |
| --- | --- |
| Status tag ("Open to work" / "Now at …"), positioning line, role labels, social links | `content/profile.yaml` |
| About: bio, facts, skills, timeline | `content/about.md` |
| Public CV | `content/cv.yaml`; the PDF goes at `content/cv.pdf` |
| Personal Work artworks | `content/artworks/artworks.yaml`, images in `content/artworks/` (same image rules) |
| The three featured projects | `content/featured.yaml` |
| Order of projects | `order:` in each project |

Anything not in `content/` (layouts, styles, the hero pattern, the hero caption, page headings,
the contact form) belongs to the site design: see [REDESIGN.md](REDESIGN.md).
