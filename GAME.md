# Game Vision & Roadmap

## North star
A **Command & Conquer: Red Alert 2 / Yuri's Revenge–style isometric RTS.** This is the long-term goal, reached *gradually* — not in one leap.

## Strategy: stepping-stone games
Instead of building a full RTS at once, build a series of progressively more complex **stepping-stone games**. Each is a complete, playable game in its own right, and each reuses + extends one shared isometric engine. Skills and code compound toward the RTS.

**Shared engine foundation** (built once, reused by every game): isometric rendering & math, tile data, camera/controls, viewport culling, depth sorting, decorations, asset pipeline. This is what Phase 1 is building.

---

## Stepping Stone 1 — iso maze / hazard-navigation (a play on Minesweeper)
*Working title: TBD.*

You control a single character with the **arrow keys** and travel from a **start** at one edge of the map to a **checkpoint** on the far side, threading past **mines, trip wires, and traps**.

- **View:** isometric (the engine we're building).
- **Movement:** real-time, arrow keys, one character.
- **Goal:** reach the checkpoint alive.
- **Hazards:** mines, trip wires, traps — **some visible, some hidden.**
- **Craters:** triggering a hidden hazard leaves a permanent **crater** on the ground (feedback + a mark you can learn from).
- **Placement:** **random across the whole map** (procedural), not hand-authored.
- **Traversal:** the **entire map is walkable** — no forced corridors or guided paths; the player chooses their own route.
- **Scope:** ship **one level first**, then consider more.

### Setting / art direction
War-torn, abandoned-battlefield aesthetic — this is where the Red Alert flavor lives (the look, not the genre). Biomes:
- **Jungle**
- **Prairie** (our current grass + water tiles fit here)
- **Snow** (with frozen rivers)

Recurring features across biomes: **downed trees, rivers, frozen rivers, dilapidated / destroyed military equipment, small ruined buildings.**

### Resolved
- **Hazards:** a blend — some visible (avoidable on sight), some hidden (a gamble until triggered).
- **Craters:** hidden hazards leave a permanent crater when triggered.
- **Placement:** random across the whole map.
- **Traversal:** fully open map, no guided paths.
- **Scope:** one level first.

### Still open (decide when we reach gameplay, not before)
- **On hitting a hazard:** instant fail + restart? cost health? just a crater and keep going?
- Whether the player gets any aid for hidden hazards (detector / proximity warning) or it's pure route-choice.
- Multi-level + biome-per-level vs one blended map.

---

## Where we are
**Done:** scrollable 256×256 iso map rendered from real terrain sprites (grass + a hand-authored water river/sand banks) via culled sprite pools @60fps; an **arrow-key player** (placeholder red dot) the camera follows; **depth sorting** (`tileX+tileY`); **tile collision** (water + solid decorations block, slide along walls); a **decoration system** (trees/bushes/tall grass) as a culled, data-driven layer. Tree anchor calibrated (origin 0.56,0.78 / scale 1). See CLAUDE.md "Status" for the exact code/file state.

**Current step:** **3d — seeded procedural scatter** (populate the whole map with decorations on walkable grass only, deterministically via a seed).

**Then:** matted-grass walked trail → hazards → feedback → fog → scoring/HUD.

The RTS-specific systems (units, combat, economy, AI) remain the far-future north star, not the next thing.

---

## Build roadmap — Stepping Stone 1
Dependency-ordered; each step is a visible win. Items marked ♻ are reusable for the RTS north star.

1. ✅ **Player character + arrow-key movement** ♻ — placeholder red-dot marker (real sprite TBD). Camera follows the player; camera pan/drag removed.
2. ✅ **Depth sorting** ♻ — `depth = tileX + tileY` for player + decorations; terrain flat behind.
3. ✅ **Decorations** ♻ — trees/bushes/tall grass via `DECORATIONS` config + culled data layer. (Crater sprite for hazards comes later — no CC0 wreckage found, see deferred.) Tree anchored & calibrated. *Still TODO within this step:* calibrate bush/tallgrass anchors; add per-type variety (random bigtree01/02/03, bush01–05…).
   - **Base/blocker alignment rule:** anchor each decoration at its **base** on its tile, and mark **that same tile** `walkable = false` (only if `solid`). Visible base must coincide with the blocked tile. A tall sprite's canopy overhangs neighbor tiles — those stay walkable; the player passes *behind* the canopy via depth sorting. (Calibrated tree origin: 0.56, 0.78.)
   - 3d. ⏳ **Seeded procedural scatter** — populate the whole map; decorations only on **walkable grass** (skip water); deterministic via a seeded PRNG.
   - 3e. **Walked trail (matted grass)** — see signature feature below.
4. **Hazards** — mines/trip-wires/traps; seeded random placement; visible-vs-hidden data; collision when the player enters a hazard tile.
5. **Trigger feedback** — explosion + permanent crater + dead body + lose a life.
6. **Fog / discovery (+ light radius)** ♻ — reveal a radius around the player; fog overlay hides the unexplored map. (Fog and lighting share one radius.)
7. **Gamification + real HUD** ♻ — lives, timer, score; win at checkpoint, lose at 0 lives; restart resets the player but **reuses the seed** (same map). Build the proper UI-scene HUD here (also fixes the faked-HUD zoom lag).
8. **Polish** — mood lighting/tint, more decoration variety, sound.

### Signature feature — walked trail (matted grass)
As the player crosses grass tiles, mark them "visited" and render them as **matted/trampled grass**, leaving a visible trail of where you've been. Distinctive and thematic (track your own route through the minefield). Implementation: a per-tile "visited" flag + a matted-grass variant (a tint of the grass tile is enough — no new art required). Build alongside/after movement.

**Determinism principle:** a level = *seed + parameters*. All randomness (hazard placement) runs through a seeded RNG, so a restart re-creates an identical map. Design this in from step 4, not after.

---

## Sprite creation — v3 side-plan (AI-assisted, RA2-style asset pipeline)

> **Deferred to v3.** v1 ships entirely on Kenney/CC0 placeholder art. This section records the *pipeline plan* so it's ready when we get there. Original art only — emulate the RA2 style, **never** ripped EA assets. **Decision: AI-assisted** — the user wants AI to do the asset creation, not hand-modeling/hand-pixeling.

**Key insight: the hard problem is consistency, not drawing.** RA2's sprites were pre-rendered from 3D (one fixed camera, one light, 32 vehicle facings) — that's what made the style cohesive. General image AI (Midjourney/DALL-E-style) fails at exactly this: every generation is a slightly different tank, lit differently, never aligned to a 64×32 diamond. So the pipeline uses purpose-built tools in two routes, with Blender kept as the *consistency machine*, not a modeling tool.

### Route A — AI mesh → Blender render rig (vehicles & buildings, many facings)
1. **AI generates the 3D model** from a text prompt or reference image: [Tripo](https://www.tripo3d.ai/) (fast, game-ready low-poly topology — current favorite for game assets), [Meshy](https://www.meshy.ai/) (best textures), or aggregator [3D AI Studio](https://www.3daistudio.com/) (several engines, one subscription).
2. **Import into Blender** (installed via Flatpak) with **one locked orthographic camera**: yaw 45°, elevation ~26.57° (`atan(0.5)`) — the 2:1 dimetric angle matching our 64×32 tiles — plus a fixed sun. One-time setup, never touched again.
3. **Auto-render rotation facings**: parent the model to an empty, keyframe a 360° spin over 8/16/32 frames, render the animation → every facing for free. A small Blender Python script batches whole folders of models.
4. **Pixelate**: render small (or downscale nearest-neighbor), transparent background.

AI does the modeling; the rig guarantees what AI can't — identical perspective/lighting across the whole roster and exact facings.

### Route B — direct AI pixel sprites (props, characters, effects)
- **[PixelLab](https://www.pixellab.ai/)** — built for game devs, notably **isometric**: generates 4/8-directional rotations of the same sprite in one click, plus text-prompted animations. Likely covers Stepping Stone 1's needs: ruined buildings, wrecked equipment (the stuff missing from CC0), hazards, craters.
- **[Retro Diffusion](https://retrodiffusion.ai/)** — authentic pixel-art generation with **animated sprite-sheet output** (walk/attack/idle) and an extension that runs **inside Aseprite**.

### Effects: explosions, fire, smoke
1. **AI-generated effect sheets** (PixelLab / Retro Diffusion animation modes) — replaces the old Mantaflow-simulation tier; far better results-per-hour.
2. **Hand-touch-up in Aseprite** where needed — 8–12 frame stylized explosions read well at 64px.
3. **Phaser particle emitter** for continuous effects (smoke trails, drifting smoke, embers) from one or two tiny puff sprites. RA2 mixed sheet explosions with particle smoke, so combining is period-correct.

### Cleanup / pixel editor
AI output gets refined by hand — the standard 2026 indie workflow is "generate ~20 variations, pick one, refine 10 min in a pixel editor" ([survey](https://www.sprite-ai.art/blog/best-pixel-art-generators-2026)), not raw output. **Aseprite** (~$20, or compile free on Linux; exports sheets + JSON Phaser loads natively); free alternatives **LibreSprite** / **Pixelorama**. Sheet packing: Aseprite export, TexturePacker free tier, or ImageMagick `montage`.

### Costs & cautions
- AI tools are credit/subscription based: roughly **$10–30/mo while actively producing**; free tiers exist for evaluation. **Check commercial-use terms** on the chosen tier.
- **Prompt-IP rule:** prompt for the *style* ("1950s-retro-futuristic tank, isometric military RTS"), never EA's actual designs ("Red Alert 2 Rhino tank") — same spirit as the no-ripped-assets policy.

### First v3 milestone
**Evaluate PixelLab's free tier**: prompt a destroyed-tank prop and an 8-frame explosion, drop them on the existing 64×32 grid. If quality lands, Route B covers most of Stepping Stone 1. Route A (Tripo → Blender rig) comes later, when the RTS needs a large consistent vehicle roster — its first milestone stays "one AI-generated tank rendered at 8 facings to validate the camera."

### Sources (researched June 2026)
- [PixelLab](https://www.pixellab.ai/) — iso sprites w/ directional rotation + animations
- [Retro Diffusion](https://retrodiffusion.ai/) — pixel-art gen + Aseprite extension
- [Tripo](https://www.tripo3d.ai/) / [Meshy](https://www.meshy.ai/) / [3D AI Studio](https://www.3daistudio.com/) — image/text → 3D mesh
- [Sprite-AI: best pixel art generators 2026](https://www.sprite-ai.art/blog/best-pixel-art-generators-2026) — tool survey
- [TRELLIS vs Meshy vs Tripo comparison](https://trellis2.app/blog/best-ai-3d-model-generator) — 3D-gen landscape
