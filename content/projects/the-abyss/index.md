---
title: The Abyss
layout: game
year: '2026'
disciplines:
  - 3d-interactive
  - tools-software
order: 4
role: Lead Developer · Lighting and Level Design
outcome: 'A finished browser game about surviving in the dark: I led its code architecture, designed its levels and built its environment and creature lighting, in a team of six.'
intro: >-
  Far below the surface, your submersible breaks down. Sonar will guide you through the dark and the torch will help you see, but light comes at a cost: every beam drains the little power you have left. Somewhere above, the surface awaits.

  The Abyss is an underwater Metroidvania made by six of us for our MSc software engineering project at Bristol. Light is its scarcest resource, and designing it was my part. I developed a style of layered, concentric rings of light and used it for everything that glows: a torch that flickers and gutters as its battery dies, bouncy bioluminescent blocks that flare and recharge the sub for as long as you touch them, jellyfish whose shocks randomly restore or drain power, and fish that glow blue in torchlight but turn red when the sonar provokes them.

  I sketched and built every level too, and on the final climb the light breaks through layer by layer as you race for the surface. In playtests, players kept clear of unlit areas without being told, and loved the light returning as they climbed. As lead developer I also set up the game’s modular architecture, so we could all build systems in parallel.
cardImage: glow.jpg
showcase:
  video: torch-battery.mp4
  poster: torch-battery.jpg
  alt: The submarine’s torch flickering on and off in the dark as the power ring counts down from 6% to empty
facts:
  role: 'Lead developer, systems architect and Product Owner. I designed the code architecture and wrote the team’s guides; built the room system; designed and animated the lighting of the sub, torch, pick-ups, environment and creatures, with their collision responses (including the red damage flash, brief invulnerability and bounce off hazards and enemies), and matched the colours objects show under sonar to that palette; lit the power ring on the HUD (its low-power glow, flashing warning, the yellow inner ring that shows the torch draining power and the matching highlighted text); sketched every level, plotted its pick-ups, enemy placements and paths and spawn points, and built it in Tiled; helped design the HUD and shop; reviewed pull requests; and made the video report. Teammates made the sprites, the sonar, missiles and explosions, and built the enemies’ behaviour from my plans.'
  tools: JavaScript, p5.js, Tiled, GitHub. Scrum.
  outcome: 'A finished game, playable in the browser. Playtests confirmed the idea the design was built on: players avoided unlit areas and used sonar sparingly without being told, and they especially enjoyed the light returning on the climb to the surface.'
links:
  - label: Play the game
    url: https://uob-comsm0166.github.io/2026-group-1/
  - label: Source on GitHub
    url: https://github.com/UoB-COMSM0166/2026-group-1
  - label: Watch the video report
    url: https://youtu.be/itvz9Tkm6_s
blocks:
  - type: gallery
    section: signature-system
    heading: Lighting
    images:
      - src: torch-battery.jpg
        video: torch-battery.mp4
        alt: The submarine’s torch flickering on and off in the dark as the power ring counts down from 6% to empty
        caption: 'Torch dying as the battery drains, with the power ring’s low-power warning (both mine); the timing took longest to get right'
      - src: glow.jpg
        alt: The yellow submarine in the dark, surrounded by soft concentric rings of blue light
        caption: 'Sub’s ambient light: concentric rings fading into the dark, my style for every light in the game'
      - src: site-lighting-torch-beam.jpg
        alt: 'The sub’s torch beam cutting down through the dark, its light in concentric rings'
        caption: 'Torch beam'
      - src: biolume-blocks.jpg
        alt: Bioluminescent blocks glowing blue around the submarine in a dark cave
        caption: 'Bioluminescent blocks: bump one and it flares, recharging the sub while you touch it'
      - src: scrap-glow.jpg
        alt: A scrap pick-up glowing softly beside the cave wall, with a violet jellyfish in the distance
        caption: 'Scrap pick-up glow: every pick-up pulses softly when you come close'
      - src: jellyfish-glow.jpg
        alt: A single jellyfish glowing violet in the dark water
        caption: 'Jellyfish glow: pink, purple and cyan, offset across head, body and legs, with squash and stretch to swim'
      - src: jellyfish-glow-test.jpg
        video: jellyfish-glow-test.mp4
        alt: 'Testing the jellyfish glow: a jellyfish pulsing through pink, purple and cyan'
        caption: 'Testing the jellyfish glow'
      - src: glow-fish.jpg
        alt: A red glow fish in the dark above the submarine and its pool of blue light
        caption: 'Glow fish: blue only in torchlight; ping it with sonar and it turns red, aggressive and visible'
      - src: sonar.jpg
        alt: A sonar pulse revealing spike walls around the submarine, with the power ring glowing red at 12%
        caption: 'Sonar pulse (by a teammate); I matched the colours it reveals to each object’s torchlight and glow'
      - src: site-lighting-sonar-pulse.jpg
        alt: 'A sonar pulse spreading through a dark cavern, the sub in the middle'
  - type: video
    section: video
    youtube: CvOZ20M2DBA
    poster: wide.jpg
    label: Watch the demo
  - type: gallery
    section: level-design
    images:
      - src: sketch-rooms-start.jpg
        alt: 'Sketchbook spread of hand-drawn room plans for the start area, hazard maze and tunnel, with a key for power, health, scrap, spikes, breakable walls, hidden passages, exits and enemies'
        caption: 'Room sketches: start area, hazard maze and tunnel, with my key for pick-ups, enemies, hazards and exits'
      - src: sketch-rooms-deep.jpg
        alt: 'Sketchbook page of the deep caverns, a maze of hatched walls and collectables, above the endless abyss, a huge empty room'
        caption: 'Deep caverns full of collectables, above the endless abyss'
        group: early-maps
      - src: sketch-world-early.jpg
        alt: 'Hand-drawn mini map of the world, each area shaded a different colour, from the endless abyss at the bottom up to the final area'
        caption: 'Early colour-coded world map, from the endless abyss to the final area'
        group: early-maps
      - src: sketch-world-complete.jpg
        alt: 'Hand-drawn map of the complete world, adding the jellyfish atrium, the biolume and the surface beside the earlier areas'
        caption: 'My final world concept, streamlined for demo day: some areas cut, others merged, to focus on fully developed rooms'
      - src: world-map.jpg
        alt: 'Labelled world map of the released game: the surface, jellyfish atrium, crab caverns, spike maze, the drop, a tunnel and the endless abyss'
        caption: 'Released game’s world map, from the surface down to the endless abyss'
        emphasis: key
      - src: tile-editor.jpg
        alt: A tile map editor showing a winding blue cave room with red hazards placed along it
        caption: Building a room in Tiled from the sketches
      - src: tiled-level-editor-early-map.jpg
        alt: 'An early blue cavern map in the Tiled level editor'
        caption: 'Early map in Tiled'
      - src: map-test.jpg
        alt: Grid map of a long winding test cave, with pick-ups and exits marked
        caption: 'Test map used during development'
      - src: map-start.jpg
        alt: Grey grid map of the starting cave, a winding passage between two larger chambers
        caption: 'Start area, where the player begins'
      - src: map-tunnel.jpg
        alt: A long, narrow tunnel map with spikes along its floor and exits at each end
        caption: 'Tunnel: a short, spiked transition'
        emphasis: key
      - src: spike-maze-map.jpg
        alt: 'An earlier layout of the spike maze map'
        caption: 'Earlier spike maze'
      - src: map-spike-maze.jpg
        alt: Grey grid map of the spike maze, a looping corridor lined with red spike walls
        caption: 'Spike maze, with spikes, pick-ups and spawn points plotted'
      - src: map-the-drop.jpg
        alt: A tall, narrow shaft map leading straight down
        caption: The drop
      - src: map-endless-abyss.jpg
        alt: A huge, almost empty cave map with rocky edges
        caption: The endless abyss
      - src: map-crab-caverns.jpg
        alt: Grid map of the crab caverns, winding corridors with crab placements and their paths marked in red
        caption: 'Crab caverns, with crab placements and paths for the enemy system'
      - src: map-final.jpg
        alt: Grid map of the jellyfish caverns with jellyfish spawns and their paths marked in red
        caption: 'Jellyfish caverns, with spawns and paths marked'
      - src: map-atrium.jpg
        alt: Grey grid map of the jellyfish atrium, a tall cave of pillars and pockets with jellyfish marked in red
        caption: 'Jellyfish atrium, jellyfish marked in red'
      - src: map-surface.jpg
        alt: Map of the final climb, a cave that widens as it rises to the surface
        caption: 'Surface: the final climb, as the light breaks through'
      - src: site-level-in-play.jpg
        alt: 'The game in play: the sub in a dark cavern with the power, sonar and torch rings below'
        caption: 'Level in play'
  - type: gallery
    section: systems
    heading: Game Systems
    images:
      - src: workshop.jpg
        alt: The workshop screen over the dimmed game, with upgrade cards for power, sonar, torch and missiles and the player’s loadout
        caption: 'Workshop (I helped design it): scrap buys power, sonar and torch upgrades'
      - src: controls.jpg
        alt: The controls screen over an illustrated seabed, listing the keys for moving, sonar, torch, missiles, workshop and settings
        caption: 'Controls screen'
  - type: gallery
    section: development
    images:
      - src: screenshot-2026-02-11-at-063443.jpg
        alt: 'A very early prototype: the player lit inside a single circle of light'
        caption: '11 Feb 2026: the light as a circle around the player'
      - src: screenshot-2026-02-22-at-185344.jpg
        alt: 'The sub glowing softly in a dark underwater scene'
        caption: '22 Feb 2026'
      - src: screenshot-2026-04-18-at-024916.jpg
        alt: 'The sub lit faintly in a dark room'
        caption: '18 Apr 2026'
      - src: screenshot-2026-04-23-at-000827.jpg
        alt: 'The sub among glowing blocks in the dark'
        caption: '23 Apr 2026'
      - src: screenshot-2026-04-30-at-164010.jpg
        alt: 'The game window: the sub among glowing blocks, with the power, sonar and torch rings'
        caption: '30 Apr 2026'
      - src: screenshot-2026-04-30-at-164114.jpg
        alt: 'The game window: the sub in the dark with a red enemy nearby'
      - src: screenshot-2026-04-30-at-164200.jpg
        alt: 'The game window: the sub near two glowing jellyfish'
      - src: screenshot-2026-04-30-at-164330.jpg
        alt: 'The game window: the sub inside a spiky cavern'
      - src: screenshot-2026-04-30-at-164335.jpg
        alt: 'The game window: the sub with its torch on in a narrow cavern'
      - src: screenshot-2026-04-30-at-164439.jpg
        alt: 'The game window: sonar outlining a cavern wall'
      - src: screenshot-2026-04-30-at-164839.jpg
        alt: 'The game window: the sub and a jellyfish in the dark'
      - src: screenshot-2026-05-01-at-104011.jpg
        alt: 'The sub’s light rings above a crab on a ledge'
        caption: '1 May 2026'
      - src: screenshot-2026-05-01-at-104150.jpg
        alt: 'The sub near a red glow fish and a glowing pick-up'
      - src: sonar-pulse-a.jpg
        alt: 'The game window: a sonar pulse outlining a cavern with spikes'
---
