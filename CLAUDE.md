# CLAUDE.md — Red Alert-Style RTS (Learning Build)

> **READ THIS FIRST.** This project is being built as a long-form **learning exercise**. The goal is for the user to understand every system they put in the game, not to ship as fast as possible. How you collaborate matters as much as what you produce.

---

## Collaboration Mode: Teach as You Build

This overrides the usual "be terse" default for this project.

- **Prefer obvious, readable code over clever or compact code**, even if it's a few more lines. The user is learning; clarity beats elegance.
- After any **non-trivial change**, give a short walkthrough: what you added, *why* that approach, what to watch out for. Trivial edits (typos, renames, formatting) don't need this.
- When introducing a new concept — isometric math, depth sorting, culling, A*, auto-tiling, sprite atlases — briefly explain **why it works**, not just what the code does.
- **Flag learning moments proactively.** If something coming up is a foundational concept ("this is the part where depth sorting clicks — here's what's happening…"), say so.
- **Do not jump ahead.** v1 scope is intentionally minimal so the user isn't drinking from a firehose. If a deferred feature seems tempting, don't pull it in — ask first.
- When the user asks "why" or "what does this do," treat it as a teaching moment, not a code lookup. Explain the concept, not just the syntax.

---

## Project Overview

**North star:** a browser-based, isometric, real-time strategy game inspired by **Command & Conquer: Red Alert 2 / Yuri's Revenge**.

**How we get there — stepping-stone games.** Rather than build the full RTS at once, we build a series of progressively more complex, *complete* games that all share one isometric engine. Skills and code compound toward the RTS. See **[GAME.md](GAME.md)** for the full vision/roadmap.

**Current deliverable — Stepping Stone 1:** an isometric **maze / hazard-navigation game** (a play on Minesweeper) — control one character with the arrow keys from a start to a checkpoint, past mines / trip wires / traps, through war-torn biomes (jungle, prairie, snow) full of downed trees, frozen rivers, and destroyed equipment. The Phase 1 map work below is the **shared engine foundation** that this game (and every later one) builds on.

### Locked Decisions (v1)

| Decision | Choice |
|---|---|
| Engine | Phaser 3 |
| Language | TypeScript |
| Build tool | Vite |
| Package manager | pnpm |
| View | Isometric (64×32 diamond tiles) |
| Map size | 256×256 tiles |
| Pathfinding | Classic A* |
| Art | Kenney CC0 placeholder packs |
| Map editing | Hand-authored in code (Tiled later) |
| Hosting | GitHub Pages or Netlify (free) |

These are **locked**. Don't suggest alternatives unless the user opens that door.

### Explicitly Deferred — Do Not Pull Forward

- Larger maps (512×512+) → **v2**
- Wear system / persistent terrain deformation → **v2**
- Rain & weather simulation → **v2**
- Flow-field pathfinding → **v2**
- Custom original art → **v3** (side-plan: our *own* RA2-inspired iso sprites — original art emulating the style, **never** ripped EA assets, which are copyrighted)

If a deferred feature seems necessary to unblock the current step, raise it as a question rather than silently adding it.

---

## Phases

### Phase 1 — Static map (current focus)

Goal: a beautifully detailed, scrollable 256×256 isometric map with terrain variety, water, dirt roads, clustered trees and rocks, lit by time of day. **Nothing moves yet.**

| Step | What | Notes |
|---|---|---|
| 1 | Tech & folder setup | Vite + Phaser "hello world" canvas |
| 2 | Grid, iso math, camera, hover, culling | Foundation for everything visual |
| 3 | Terrain + auto-tiling + time-of-day tint | Tile data architecture established here |
| 4 | Decorations (trees, rocks) + **depth sorting** | The "snaps into 3D" moment |
| 5 | Multi-tile buildings as static props | No functionality — purely visual |

### Later phases (not in scope yet)

- **Phase 2** — movable assets (units, vehicles, ambient movement)
- **Phase 3** — interaction (selection, pathfinding, build mode)
- **Phase 4** — game dynamics (combat, resources, production, AI, fog of war, win conditions)

---

## Folder Structure (target)

Organized by **concept** (world, camera, scenes), not by file type. Scales as the project grows.

```
red-alert-clone/
├── public/
│   └── assets/
│       ├── tiles/          ← terrain sprites
│       ├── sprites/        ← units, buildings, decorations
│       └── audio/          ← sounds, music (later)
├── src/
│   ├── main.ts             ← entry point, boots Phaser
│   ├── config.ts           ← game constants (tile size, map size, etc.)
│   ├── scenes/
│   │   ├── BootScene.ts    ← preload assets
│   │   └── GameScene.ts    ← the actual game
│   ├── world/
│   │   ├── IsoMath.ts      ← coordinate conversion (screen ↔ tile)
│   │   ├── Tile.ts         ← tile data class
│   │   └── TileMap.ts      ← the map itself
│   ├── camera/
│   │   └── CameraController.ts
│   └── types/
│       └── index.ts        ← shared TypeScript types
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

---

## Architecture: Three Load-Bearing Pieces

These three get reused by **everything** that comes later. Get them right.

### 1. Isometric coordinate math (Step 2a)

`tileToScreen(tileX, tileY)` and `screenToTile(pixelX, pixelY)` are the bedrock. Every later feature — placement, hover, selection, pathfinding rendering, projectiles — calls these. Write them as pure functions, test them with a few known values before building on top.

### 2. Tile data architecture (Step 3b)

- Flat array indexed by `y * width + x` (faster than 2D arrays, easier to iterate).
- Each tile carries: `type`, `walkable`, `buildable`.
- Add `walkable` / `buildable` flags **now**, before there are any units. Cheap to add early, painful to retrofit.

### 3. Depth sorting (Step 4c)

- Phaser supports `setDepth()` natively.
- For any drawn object: `depth = tileX + tileY` (diagonal sort — things further "back" draw first).
- Buildings use the **front-most tile** of their footprint (highest `tileX + tileY`) so they correctly occlude things behind them.
- Once this works, the world snaps into a 3D-feeling layered scene.

---

## Performance: Culling Is Mandatory

256×256 = **65,536 tiles**. ~6,500 decorations at 10% density. Naive rendering tanks framerate.

- Only render tiles + decorations within the camera viewport + a small margin.
- Re-apply this same pattern later for units, projectiles, particles.
- Target: rock-solid **60fps** after culling.

---

## When Working in This Repo

1. **Check what step we're on** before suggesting changes. Don't pull v2/Phase-2 work into Phase 1.
2. **Explain non-trivial decisions** in the response, not in code comments. (Code comments still follow the usual rule: only when *why* is non-obvious.)
3. **Use Kenney assets** for art. Don't generate, don't suggest paid packs, don't substitute styles.
4. **Hand-author maps in code** for now. Don't introduce Tiled or a map editor unless asked.
5. **Stay inside the folder structure above.** If a new file genuinely doesn't fit, surface that before adding it.
6. **No premature abstraction.** Three similar lines is fine; an early framework is not. The learning value comes from seeing the concrete shape first.

---

## Status

> **The project pivoted** from "build an RTS directly" to **stepping-stone games** → see [GAME.md](GAME.md). Current build = **Stepping Stone 1: an isometric maze / Minesweeper-style hazard game.** The Phase-1 map steps below are the **shared engine foundation**. GAME.md holds the maze-game build roadmap and design decisions; this section is the current code state.

**Engine + game built so far (all running, ~60fps):**

- `world/IsoMath.ts` — pure `tileToScreen` / `screenToTile` (round-trip verified). Tile (0,0) → world (0,0); returns the diamond center.
- `world/Tile.ts` + `world/TileMap.ts` — `Tile` carries `type` / `walkable` / `buildable` (derived from type in ctor; water unwalkable, grass/dirt buildable). `TileMap` = flat array `y*width+x`, with `getTile` / `setType` / `inBounds`. Pure data, no rendering.
- `types/index.ts` — `TileType` union: grass | dirt | sand | water_shallow | water_deep.
- `config.ts` — `TILE` 64×32, `MAP` 256×256, `GAME.backgroundColor`, `TILE_COLORS` (legacy from the colored-diamond stage, now unused).
- `camera/CameraController.ts` — **zoom only** now (mouse wheel, clamped 0.25–2×). Keyboard-pan and left-drag were **removed**: the camera now **follows the player** (GameScene `centerOn(player)` each frame). Constructed for its side effect; not stored.
- `entities/Player.ts` — arrow-key movement (real-time, delta-scaled, 200 px/s, screen-aligned). **Collision** via the `walkable` flag, resolved per-axis (slide along walls); water + solid decorations block. Depth = `screenToTile(x,y)` sum (smooth). Placeholder = red circle (radius 10); real sprite TBD.
- `scenes/BootScene.ts` — loads `terrain` spritesheet (`assets/tiles/grass_and_water.png`, 64×64 frames) + plant images `tree`=bigtree01, `bush`=bush01, `tallgrass`=grasses01.
- `scenes/GameScene.ts` — the world:
  - **Terrain**: culled **sprite pool** (`tileSprites`), only visible tiles drawn (worldView-corner bounding box + `CULL_MARGIN`, `lastRange` dirty-check). `TILE_FRAMES`: grass→0, water_shallow/deep→23, dirt/sand→0 (no art yet, fall back to grass). Tile sprite origin (0.5, 0.75).
  - **Decorations**: `DECORATIONS` config (per type: key, scale, originX/Y, solid). **Tree calibrated: origin (0.56, 0.78), scale 1, solid.** Data = sparse `Map<tileIndex, type>` via `placeDecoration` (writes data + marks `walkable=false` if solid). Rendered through the SAME cull loop via a second pool (`decoSprites`), depth = `tileX+tileY`. ~8 decorations hand-placed near (115,115).
  - **`authorMap()`**: hand-authored river (water + sand banks) + dirt road around tiles 100–160.
  - HUD: FPS + Zoom text, faked (re-pinned via `getWorldPoint` + `1/zoom` scale each frame). Hover highlight (yellow diamond, debug).

**Art (CC0/CC-BY, see [CREDITS.md](CREDITS.md)):**
- Terrain: *Grass and Water Tiles* — Clint Bellanger, **CC-BY 3.0** (`public/assets/tiles/grass_and_water.png`, 256×384 = 4×6 of 64×64; grass frames 0–3, banks 4–19, water 22–23).
- Plants: *Free Isometric Plants Pack* — yughues, **CC0** (`public/assets/sprites/plants/`, 73 PNGs: bigtree/pine[none/half/full snow]/bush/shrub/grasses/weed/tropical/palm/bamboo/cactus).

**Open / deferred (not blocking):**
- **Bush + tallgrass anchors not calibrated** — bush `originY` is a guess (0.5, likely floats); tune like the tree when convenient.
- **Proper HUD** — faked FPS/Zoom text lags one frame on zoom; real fix = dedicated UI scene / 2nd unzoomed camera, build at maze step 7.
- **Destroyed/military equipment art** — scarce in CC0; fold into v3 custom art.
- **v3 side-plan** — our own RA2-inspired sprites (never ripped EA assets), **AI-assisted** (user decision, June 2026: AI creates assets, not hand-modeling). Full pipeline + sources in GAME.md § "Sprite creation": [PixelLab](https://www.pixellab.ai/) (iso sprites, 4/8-dir rotations) / [Retro Diffusion](https://retrodiffusion.ai/) (pixel art + Aseprite ext.) for direct sprites & effect sheets; [Tripo](https://www.tripo3d.ai/) / [Meshy](https://www.meshy.ai/) / [3D AI Studio](https://www.3daistudio.com/) for AI mesh → Blender iso render rig (Blender installed via Flatpak). First milestone: evaluate PixelLab free tier.

**Next concrete action:** **Maze step 3d — seeded procedural scatter.** Add a small **seeded RNG** (a level = a seed; `Math.random` is unavailable/blocked, so write a tiny deterministic PRNG), walk the map, and drop trees/bushes/tall-grass only on **walkable grass** (skip water/river). It flows through the existing decoration culling, so thousands stay cheap. The seed is the foundation hazards (step 4) reuse for "same map on restart." Then: walked-trail matted grass (3e) → hazards (4).
