# Content guide

Everything in `content/` is **content**: it survives every redesign unchanged. Everything else in
this repo (`src/`, `tools/`, `worker/`) is the **site design**, which a redesign replaces. Content
is stored as *things* (projects, artworks, the profile, About, CV entries, the featured choice),
never as pages: which pages exist and what goes on them is up to the site design.

The build checks every file against this guide. An unknown or misspelt field, a missing required
field, an image without alt text or a file that isn't in the folder stops the build with a message
saying where. `npm run check` also runs the **coverage check**, which lists content that appears
nowhere on the built site (see [REDESIGN.md](REDESIGN.md)).

How to add things step by step: [ADDING-CONTENT.md](ADDING-CONTENT.md).

```
content/
  profile.yaml        name, status tag, positioning line, role labels, social links
  about.md            bio, plus facts, skills and the timeline
  cv.yaml             the Public CV
  cv.pdf              the PDF CV (optional; the site offers it once it's here)
  featured.yaml       the three featured projects, in order
  projects/<id>/      one folder per project: index.md + its images and clips
  artworks/           artworks.yaml + one image per artwork
```

No layout goes in content: no sizes, widths, colours, "wide", "full-bleed" or row heights. The
only hint about how things matter is **emphasis** (below), which any site design may honour or
ignore.

## Projects: `content/projects/<id>/index.md`

The folder name is the project's **id**: lowercase words joined by hyphens (`capturing-the-sun`).
It is used in links and must match the project's folder in `originals/`. The file is front matter
only (between the two `---` lines). File names in it refer to files in the same folder.

| Field | Required | What it is |
| --- | --- | --- |
| `title` | yes | The project's name. |
| `year` | yes | Year or span, e.g. `'2024'` or `2018–2025`. |
| `disciplines` | yes | One or more of `illustration-print`, `film-animation`, `3d-interactive`, `tools-software`, `personal-work`. |
| `order` | yes | Position in project lists, 1 first. No two projects share a number. |
| `draft` | no | `true` keeps the project off the live site; it still shows in previews. |
| `role` | yes | The **project role**: Georgia's own part, in a few words ("Writer and Director"). |
| `outcome` | yes | One sentence on **what came of it** (results), for project cards. Also the line on a feature card, unless `featureText` is set. |
| `featureText` | no | A custom line for the project's feature card on Home, used instead of the outcome. Leave it out to show the outcome there too, so the project reads the same everywhere. |
| `outcomeLong` | no | A longer version of the outcome. |
| `intro` | yes | The opening paragraph: the brief, what she did, how it went. |
| `description` | no | Text for search engines and link previews; the intro is used if left out. |
| `cardImage` | yes | The image that stands for the project in lists (cropped 4:3, so keep the subject central). |
| `showcase` | yes* | The **showcase media**: the one clip or image that best represents the project. See below. |
| `facts` | yes | `role` (what she did, in full), `tools` (only tools she used herself), `outcome` (results in full). |
| `links` | no | Buttons: each `label` + `url`, plus `youtube: true` for a YouTube link. |
| `ownTool` | no | `true` if something in it was made with one of her own tools (the own-tool tag). |
| `ownToolNote` | no | A sentence about how her tools were used here. |
| `ownToolLinks` | no | Projects to point to from that note: each `label` + `project` (a project id). |
| `blocks` | no | The project's media, in order: galleries and videos (below). |

\* `showcase` is required for the three featured projects, and will be required for every project
once the content pass has picked them.

### `showcase`

Either an image:

```yaml
showcase:
  image: doorway.jpg
```

or a silent looping clip, with a still to show before it plays and alt text describing it:

```yaml
showcase:
  video: preview.mp4        # MP4 H.264, required
  webm: preview.webm        # optional second format
  poster: preview.jpg
  alt: Animated preview of Pattinator, its title over patterns that keep changing
```

### Blocks

A **gallery** is a group of images under an optional heading:

```yaml
blocks:
  - type: gallery
    heading: Storyboards
    images:
      - src: storyboard-market.jpg
        alt: 'Storyboard: looking down the market street towards the tree'
        caption: The market street, looking towards the tree
        emphasis: key
```

| Image field | Required | What it is |
| --- | --- | --- |
| `src` | yes | File name in the project folder. |
| `alt` | yes | What the image shows, for people who can't see it. Never empty. |
| `caption` | no | The line shown under it. |
| `emphasis` | no | `key`: one of the images that matter most in the project. |
| `group` | no | A name shared by images that belong together (e.g. a before and after). |
| `video` | no | Makes the item a silent looping clip (MP4, same rules as showcase clips); `src` is then its poster still. |
| `webm` | no | An optional second format for the clip. |

A clip in a gallery:

```yaml
      - src: torch-dying.jpg        # poster still, same size as the clip
        video: torch-dying.mp4
        alt: The submarine's torch flickering as the power runs out
        caption: The torch as its battery dies
```

A **video** is a film on YouTube, shown as its poster image until played:

```yaml
  - type: video
    youtube: fKp3UTxZdac      # the id from the YouTube link
    poster: storyboard-market.jpg
    label: Watch the animatic
    caption: 3D previs concept teaser   # optional
    heading: …                          # optional
```

## Featured projects: `content/featured.yaml`

Exactly three project ids, in the order they appear. Each needs `showcase` media; `featureText` is optional.

```yaml
- capturing-the-sun
- christmas-cards
- pattinator
```

## Profile: `content/profile.yaml`

| Field | Required | What it is |
| --- | --- | --- |
| `name` | yes | Georgia Sweeny. |
| `status` | yes | The **status tag**: `text` ("Open to work · London area" or "Now at …") and `open` (`true` while looking for work). |
| `location` | yes | Rough location only ("London area"), never an address. |
| `positioning` | yes | The **positioning line**. |
| `roles` | yes | The **role labels**, in order. |
| `description` | yes | The site's default text for search engines and link previews. |
| `social` | yes | Links by name: `linkedin`, `github`, `youtube`. |

## About: `content/about.md`

The bio is the text below the front matter, one paragraph per block of text. Its first paragraph is
the opening line (the About page leaves it out because the positioning line already says it; the
CV uses all of it).

| Front matter | Required | What it is |
| --- | --- | --- |
| `facts` | yes | Headline numbers: each `value` ("7 years") and `label` ("running my own …"). |
| `skills` | yes | Groups of skills: `Group name:` then a list, most relevant first. |
| `timeline` | yes | Experience and education, newest first: each `year`, `title`, optional `note`. |

## Public CV: `content/cv.yaml`

No email address, phone number or street address, ever. Never longer than two printed pages.

| Field | Required | What it is |
| --- | --- | --- |
| `sections` | yes | Section names for the jump links, in order. |
| `skills` | yes | Each `group` + `text`. |
| `experience` | yes | Each `title`, `years`, `points` (a list of sentences). |
| `projects` | yes | Each `title`, `years`, `points`, and optionally `sub` (subtitle), `tools`, `project` (a project id, to link to its page). |
| `education` | yes | Each `qual`, `place`, `years` (may be `''`), optional `note`. |
| `certifications` | no | A list of lines. |
| `awards` | no | A list of lines. |
| `interests` | no | One line. |

The PDF CV, when there is one, goes at `content/cv.pdf`.

## Artworks: `content/artworks/artworks.yaml`

A list of artworks for Personal Work, each with its image in `content/artworks/`. No prices, ever.

| Field | Required | What it is |
| --- | --- | --- |
| `title` | yes | |
| `medium` | yes | e.g. Watercolour and ink |
| `year` | yes | |
| `image` | yes | File name in `content/artworks/`. |
| `alt` | yes | What the artwork shows. |
| `sold` | no | `true` once it has been bought. |

## Files

Images and clips are web-ready copies made from **originals** kept outside the repo
(`../originals/<id>/`). The rules (JPEG q82, sRGB, 2400px, no metadata; silent MP4 clips) are in
[ADDING-CONTENT.md](ADDING-CONTENT.md). Names are short, lowercase, hyphenated and descriptive,
with no project prefix: `capturing-the-sun/storyboard-market.jpg`.
