---
title: Islamic Pattern Generator
year: '2024'
disciplines:
  - tools-software
order: 9
role: Tool Designer and Developer
outcome: A Houdini tool that builds Islamic geometric patterns live from their traditional construction rules; its patterns went into the costumes, props and set of The Tale of Capturing the Sun.
intro: 'My first project in Houdini (3D software built from networks of connected steps called nodes): a reusable digital asset that builds Islamic geometric patterns the way they are traditionally drawn, from a circle or polygon repeated, rotated and mirrored across square or hexagonal tiles. I based the steps on published shape grammar research and laid the controls out in that same order, so an artist who has never opened Houdini can design a pattern or a single motif and watch it update as they work. On The Tale of Capturing the Sun I used it to build the geometry of props and set pieces, to make textures and displacement and normal maps in Substance 3D Painter, and as line art in 2D illustrations. It later led to Pattinator.'
cardImage: patterns.jpg
showcase:
  video: levels-of-detail.mp4
  poster: levels-of-detail.jpg
  alt: Screen recording from the Houdini viewport, a white line pattern on black growing denser and more detailed as the tool’s controls are changed
facts:
  role: Research, tool design and build, supervised by Oleg Fryazinov at the NCCA, Bournemouth University. I taught myself Houdini and the basics of VEX for this project, and designed the controls around how artists already work.
  tools: 'SideFX Houdini: a digital asset (HDA), which packages a node network as one tool with its own controls. VEX, Houdini’s scripting language.'
  outcome: 'A working tool with square or hexagonal tiles, pattern or motif output, and edges clipped to the grid, ready for texture maps or effects geometry. It made more than 15 distinct patterns from one rule set. On The Tale of Capturing the Sun its patterns became prop and set geometry, textures and displacement and normal maps, and line art for 2D illustrations.'
links:
  - label: Source on GitHub
    url: https://github.com/GeorgiaSweeny/Pattern_Generator_HDA
blocks:
  - type: gallery
    heading: Inside the Tool
    images:
      - src: interface-pattern.jpg
        alt: 'The tool’s control panel in Houdini in Pattern mode, with sections for Output Selection, Grid Tiles, Initial Shape, Shape Grammar and Display Options, each with menus, sliders and checkboxes'
        caption: 'The controls in Pattern mode, in the order a pattern is traditionally drawn: tiles, initial shape, shape grammar'
        group: interface
      - src: interface-motif.jpg
        alt: The same control panel in Motif mode, with a Motif Tile section in place of Grid Tiles
        caption: Motif mode makes a single motif on one tile
        group: interface
      - src: network-overview.jpg
        alt: Zoomed-out Houdini node network of seven coloured boxes of nodes with yellow notes beside them, all joined to one output
        caption: The whole node network behind the controls
      - src: network-initial-shape.jpg
        alt: A gold network box labelled Initial Shape Generator, with circle, polygon, switch, reverse, polycut and clean nodes, and notes explaining them
        caption: 'The initial shape: a circle or many-sided polygon, scaled to stay the same size in every tile'
      - src: network-tile-grid.jpg
        alt: A teal network box for the tile grid, with square and hexagon branches meeting at a switch, then fuse and edge-equalise nodes
        caption: The tile grid, squares or hexagons, fused and evened out so they tessellate without gaps
      - src: network-shape-grammar.jpg
        alt: A pink network box labelled Shape Grammar Rules, with translate, rotate and duplicate, clip, mirror, copy and fuse nodes, and notes explaining them
        caption: 'The shape grammar rules: translate, rotate and duplicate, then mirror one segment to keep the symmetry'
      - src: network-clip-edges.jpg
        alt: Two blue network boxes that clip the pattern to the grid using polywire, boolean and blast nodes, with a switch to turn it on or off
        caption: 'Clipping the edges: the lines become geometry for a boolean cut, then lines again; a switch keeps it off while you design'
  - type: video
    youtube: ktCdd7lKSzg
    poster: patterns.jpg
    label: Watch the tool demo
  - type: gallery
    heading: Patterns and Motifs
    images:
      - src: title-pattern.jpg
        alt: A dense white line pattern of interlaced octagons and stars on black
        caption: A tessellated pattern on square tiles
        emphasis: key
      - src: motif-a.jpg
        alt: A single motif in white line on black, a star inside layered rotated polygons, framed by a hexagonal tile
        caption: A motif on a hexagonal tile
        group: motifs
      - src: motif-b1.jpg
        alt: A denser motif of many rotated polygons forming a ring, inside a hexagonal tile
        caption: The same idea with more rotated copies
        group: motifs
      - src: motif-b2.jpg
        alt: The ring-shaped motif on its own, with the tile turned off
        caption: The same motif with the tile turned off
        group: motifs
      - src: pattern-a.jpg
        alt: Overlapping circular rosettes on a hexagonal grid, spilling past its edges
        caption: Rosettes on hexagonal tiles, overlapping into new shapes
      - src: pattern-b1-unclipped.jpg
        alt: A square-tiled line pattern whose lines spill untidily past the edge of the grid
        caption: Before Clip Pattern Edges, the lines spill past the grid
        group: clipping
      - src: pattern-b2-clipped.jpg
        alt: The same square-tiled pattern trimmed neatly to the edge of the grid
        caption: After, trimmed to the grid and ready for a texture map
        group: clipping
      - src: patterns.jpg
        alt: A grid of fifteen generated geometric patterns in white line on black
        caption: Fifteen patterns, all generated from the same rule set
  - type: gallery
    heading: The Research
    images:
      - src: poster.jpg
        alt: Research poster explaining the node network pipeline, interface and results
        caption: 'Research poster: pipeline, interface and findings'
---
