---
title: Pattinator
layout: software
year: '2026'
disciplines:
  - tools-software
order: 1
role: Designer and Developer
featureText: 'The tool behind the pattern in my name at the top of this page: my MSc research into one shared language for random and rule-based design.'
outcome: A shared pattern vocabulary that fitted all nine generators tested, and combined existing rule sets into new hybrid patterns.
intro: >-
  What if every pattern, from random noise to perfect geometric tilings, could be described in one shared vocabulary? That was the question behind my MSc Computer Science dissertation at Bristol.

  Nine pattern generators, from the randomness of Perlin noise to the strict geometry of Islamic star patterns, were built from one shared set of building blocks, and a handful of ways of combining them fitted every one. Pattinator (“pattern” plus “combinator”, the programming term for those ways of combining) is the web app that shows it: each pattern laid out as connected nodes, stage by stage, so learners with no coding background can see how it’s made and change it.

  It grew out of my earlier Islamic Pattern Generator, a Houdini tool limited to one family of patterns; writing the algorithms in code instead opened up the whole spectrum.
cardImage: preview.jpg
showcase:
  video: preview.mp4
  webm: preview.webm
  poster: preview.jpg
  alt: Animated preview of Pattinator, its title over patterns that keep changing from one style to the next
facts:
  role: Interface and interaction design, the visual workflow, and the pattern library. I ran the research, designed the node-graph UI, and built the app.
  tools: React, React Flow, JavaScript (SVG and Canvas rendering). Claude Code for AI-assisted review.
  outcome: The vocabulary accounted for all nine generators, from random noise to Islamic star patterns, and combining existing rule sets produced new hybrid patterns that shift smoothly between their parents as the settings change. Two user studies with 25 participants also found a small but real gain in understanding.
links:
  - label: Open the live app
    url: https://georgiasweeny.github.io/pattinator/
  - label: Source on GitHub
    url: https://github.com/GeorgiaSweeny/algorithmic-pattern-explorer
blocks:
  - type: gallery
    section: what-it-does
    heading: Patterns from One Shared Vocabulary
    images:
      - src: pattern-01.jpg
        alt: 'Generated pattern: green interlocking stars'
      - src: pattern-02.jpg
        alt: 'Generated pattern: red and gold star medallions'
      - src: pattern-03.jpg
        alt: 'Generated pattern: teal Voronoi rosettes'
      - src: pattern-04.jpg
        alt: 'Generated pattern: pink and green diagonal bands'
      - src: pattern-05.jpg
        alt: 'Generated pattern: violet starfield'
      - src: pattern-06.jpg
        alt: 'Generated pattern: soft pink clouded noise'
      - src: pattern-07.jpg
        alt: 'Generated pattern: orange diamonds on brown'
      - src: pattern-08.jpg
        alt: 'Generated pattern: acid yellow and magenta reaction diffusion'
      - src: pattern-09.jpg
        alt: 'Generated pattern: autumn-toned Voronoi cells in brown, orange, teal and lilac'
      - src: pattern-10.jpg
        alt: 'Generated pattern: pink and magenta layered star medallions'
      - src: pattern-11.jpg
        alt: 'Generated pattern: salmon and teal Voronoi square lattice'
      - src: pattern-12.jpg
        alt: 'Generated pattern: yellow Voronoi starburst'
      - src: pattern-13.jpg
        alt: 'Generated pattern: clouded teal Perlin noise'
      - src: pattern-14.jpg
        alt: 'Generated pattern: black and white Perlin swirl'
      - src: pattern-15.jpg
        alt: 'Generated pattern: navy and yellow Perlin noise with an animal silhouette emerging'
      - src: escher-translation-24.jpg
        alt: 'Generated pattern: interlocking pink, teal and grey Escher-style tiles'
      - src: islamic-rosette-2-copy.jpg
        alt: 'Generated pattern: red rosettes on charcoal'
      - src: islamic-rosette-copy.jpg
        alt: 'Generated pattern: orange six-pointed stars and triangles on cream'
      - src: recursive-grid.jpg
        alt: 'Generated pattern: an orange recursive grid'
      - src: ridge-noise-8.jpg
        alt: 'Generated pattern: blue-grey ridge noise with tan highlights'
      - src: pattinator-banner.jpg
        alt: 'Pattinator banner: bands of different generated patterns side by side'
  - type: gallery
    section: inside-the-tool
    heading: Designing the Interface
    images:
      - src: sketch.jpg
        alt: Hand-drawn wireframe sketches of the app layout
        caption: First wireframes, working out how to hide the technical layer
      - src: prototype.jpg
        alt: Early prototype showing a noise texture and a checkerboard
        caption: 'Early prototype: the first algorithms running'
      - src: interface.jpg
        alt: The finished app showing the node graph editor beside a generated green pattern
        caption: 'The finished editor: node graph on the left, live pattern on the right'
      - src: gallery.jpg
        alt: The gallery screen showing a grid of saved patterns
        caption: The gallery, where learners load an example and take it apart
  - type: gallery
    section: development
    images:
      - src: parametrised-pattern-generator-3.jpg
        alt: 'Four Voronoi cell patterns, each with its sliders, from an earlier pattern generator'
        caption: 'An earlier version: the parametrised pattern generator (v3)'
      - src: parametrised-pattern-generator-4.jpg
        alt: 'Four Perlin noise patterns with their sliders, from the earlier generator'
      - src: parametrised-pattern-generator-5.jpg
        alt: 'Four ridge noise patterns with their sliders, from the earlier generator'
      - src: screenshot-2026-08-20-at-123848.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
        caption: 'Outputs from my earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123855.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123859.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123912.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123934.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123940.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123945.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-123951.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-124008.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202557.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202607.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202717.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202750.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202827.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202839.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-202941.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-203020.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-203030.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-203055.jpg
        alt: 'Black and white geometric pattern from the earlier star-line and rosette generator'
      - src: screenshot-2026-08-20-at-132746.jpg
        alt: 'Terminal output: a geometric pattern printed in text characters'
        caption: 'Testing the Islamic rebuild: patterns printed as text in the terminal'
      - src: screenshot-2026-08-20-at-132813.jpg
        alt: 'Terminal output: a geometric pattern printed in text characters'
      - src: screenshot-2026-08-20-at-132837.jpg
        alt: 'Terminal output: a geometric pattern printed in text characters'
      - src: screenshot-2026-08-20-at-132924.jpg
        alt: 'Terminal output: a geometric pattern printed in text characters'
---
