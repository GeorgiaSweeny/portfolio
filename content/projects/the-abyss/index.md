---
title: The Abyss
year: '2026'
disciplines:
  - 3d-interactive
  - tools-software
order: 4
role: Lead Developer · Lighting and Level Design
outcome: 'A finished browser game about surviving in the dark: I led its code architecture, designed its levels and built its environment and creature lighting, in a team of six.'
intro: 'Far below the surface, your submersible breaks down. Sonar will guide you through the dark and the torch will help you see, but light comes at a cost: every beam drains the little power you have left. Somewhere above, the surface awaits. The Abyss is an underwater Metroidvania made by six of us for our MSc software engineering project at Bristol. Light is its scarcest resource, and designing it was my part. I developed a style of layered, concentric rings of light and used it for everything that glows: a torch that flickers and gutters as its battery dies, bouncy bioluminescent blocks that flare and recharge the sub for as long as you touch them, jellyfish whose shocks randomly restore or drain power, and fish that glow blue in torchlight but turn red when the sonar provokes them. I sketched and built every level too, and on the final climb the light breaks through layer by layer as you race for the surface. In playtests, players kept clear of unlit areas without being told, and loved the light returning as they climbed. As lead developer I also set up the game’s modular architecture, so we could all build systems in parallel.'
cardImage: glow.jpg
showcase:
  video: torch-dying.mp4
  poster: torch-dying.jpg
  alt: The submarine’s torch flickering on and off in the dark as the power ring counts down from 6% to empty
facts:
  role: 'Lead developer, systems architect and Product Owner. I designed the code architecture and wrote the team’s guides; built the room system; designed and animated the lighting of the sub, torch, pick-ups, environment and creatures, with their collision responses (including the red damage flash, brief invulnerability and bounce off hazards and enemies), and matched the colours objects show under sonar to that palette; sketched every level, plotted its pick-ups, enemy placements and paths and spawn points, and built it in Tiled; helped design the HUD and shop; reviewed pull requests; and made the video report. Teammates made the sprites, the sonar, missiles and explosions, and built the enemies’ behaviour from my plans.'
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
    heading: Lighting
    images:
      - src: glow.jpg
        alt: The yellow submarine in the dark, surrounded by soft concentric rings of blue light
        caption: 'The sub’s ambient light: concentric rings fading into the dark, the style I made for every light in the game'
      - src: biolume-blocks.jpg
        alt: Bioluminescent blocks glowing blue around the submarine in a dark cave
        caption: Bioluminescent blocks; bump one and it flares brighter, recharging the sub for as long as you touch it
      - src: scrap-glow.jpg
        alt: A scrap pick-up glowing softly beside the cave wall, with a violet jellyfish in the distance
        caption: A scrap pick-up’s ambient glow; every pick-up glows or pulses softly, like the sub, when you come close
      - src: jellyfish-glow.jpg
        alt: A single jellyfish glowing violet in the dark water
        caption: A jellyfish’s glow cycles through pink, purple and cyan, offset between its head, body and legs so the shapes stay clear, and squashes and stretches to make it swim
      - src: glow-fish.jpg
        alt: A red glow fish in the dark above the submarine and its pool of blue light
        caption: A glow fish shows blue only in torchlight; ping it with sonar and it turns red, aggressive and visible in the dark
      - src: glow-fish-provoked.jpg
        alt: A glow fish glowing red beside the submarine, above a bioluminescent block glowing blue
        caption: A provoked glow fish, red after a sonar ping, beside a glowing bioluminescent block
      - src: sonar.jpg
        alt: A sonar pulse revealing spike walls around the submarine, with the power ring glowing red at 12%
        caption: A sonar pulse (by a teammate); I matched the colours objects show when it hits them to how they look in torchlight and glow
  - type: video
    youtube: CvOZ20M2DBA
    poster: wide.jpg
    label: Watch the demo
  - type: gallery
    heading: Level Design
    images:
      - src: sketch-rooms-start.jpg
        alt: 'Sketchbook spread of hand-drawn room plans for the start area, hazard maze and tunnel, with a key for power, health, scrap, spikes, breakable walls, hidden passages, exits and enemies'
        caption: Room sketches for the start area, hazard maze and tunnel, with my key for pick-ups, enemies, spikes, breakable walls, hidden passages and exits
        group: sketches
      - src: sketch-rooms-deep.jpg
        alt: 'Sketchbook page of the deep caverns, a maze of hatched walls and collectables, above the endless abyss, a huge empty room'
        caption: 'The deep caverns, full of collectables, and the endless abyss below: a big, seemingly endless space'
        group: sketches
      - src: sketch-world-early.jpg
        alt: 'Hand-drawn mini map of the world, each area shaded a different colour, from the endless abyss at the bottom up to the final area'
        caption: An early colour-coded map of the whole world, from the endless abyss up to the final area
        group: sketches
      - src: sketch-world-complete.jpg
        alt: 'Hand-drawn map of the complete world, adding the jellyfish atrium, the biolume and the surface beside the earlier areas'
        caption: 'My final world concept. For demo day we streamlined it: some areas were cut, with the new enemy types and hazards planned for them, and others merged, so we could focus on fully developed rooms'
        group: sketches
        emphasis: key
      - src: world-map.jpg
        alt: 'Labelled world map of the demo: the surface, jellyfish atrium, crab caverns, spike maze, the drop, a tunnel and the endless abyss'
        caption: The released game’s world map, showing how the rooms connect, from the surface down to the endless abyss
      - src: tile-editor.jpg
        alt: A tile map editor showing a winding blue cave room with red hazards placed along it
        caption: Building a room in Tiled from the sketches
      - src: map-test.jpg
        alt: Grid map of a long winding test cave, with pick-ups and exits marked
        caption: A test map we used during development
      - src: map-start.jpg
        alt: Grey grid map of the starting cave, a winding passage between two larger chambers
        caption: The start area of the released game, where the player begins
      - src: map-tunnel.jpg
        alt: A long, narrow tunnel map with spikes along its floor and exits at each end
        caption: The tunnel, a short transition with spikes along the floor
        emphasis: key
      - src: map-spike-maze.jpg
        alt: Grey grid map of the spike maze, a looping corridor lined with red spike walls
        caption: The spike maze, with spikes, pick-ups and spawn points plotted
      - src: map-the-drop.jpg
        alt: A tall, narrow shaft map leading straight down
        caption: The drop
      - src: map-endless-abyss.jpg
        alt: A huge, almost empty cave map with rocky edges
        caption: The endless abyss
      - src: map-crab-caverns.jpg
        alt: Grid map of the crab caverns, winding corridors with crab placements and their paths marked in red
        caption: The crab caverns, with crab placements and paths plotted for the enemy system
      - src: map-final.jpg
        alt: Grid map of the jellyfish caverns with jellyfish spawns and their paths marked in red
        caption: The jellyfish caverns, with jellyfish spawns and paths marked
      - src: map-atrium.jpg
        alt: Grey grid map of the jellyfish atrium, a tall cave of pillars and pockets with jellyfish marked in red
        caption: The jellyfish atrium, its jellyfish marked in red
      - src: map-surface.jpg
        alt: Map of the final climb, a cave that widens as it rises to the surface
        caption: 'The surface: the final climb, where the light slowly breaks through'
  - type: gallery
    heading: Game Systems
    images:
      - src: workshop.jpg
        alt: The workshop screen over the dimmed game, with upgrade cards for power, sonar, torch and missiles and the player’s loadout
        caption: 'The workshop, which I helped design: players spend scrap on power, sonar and torch upgrades'
      - src: controls.jpg
        alt: The controls screen over an illustrated seabed, listing the keys for moving, sonar, torch, missiles, workshop and settings
        caption: The controls screen
---
