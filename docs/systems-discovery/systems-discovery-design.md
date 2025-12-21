# Systems Discovery — Point-and-Click (Design Doc)

Purpose

- Fun, replayable point-and-click about discovering everyday systems and how they interconnect. Core pack introduces the
  idea of “systems thinking” with approachable, moral, and curiosity-first stories. Extensions add themed packs: Space (
  Solar System) and Ocean (Deep Sea).

Audience & Tone

- Ages 8–12 baseline; cozy curiosity with gentle humor; kindness-first guardrails. No fear or catastrophe framing; we
  celebrate stewardship and discovery.

MVP Goals (Core Pack)

- 10–15 minutes total, 3 short scenes + wrap-up.
- Clickable hotspots, mini-puzzles (match, assemble, sort), light dialogue.
- Replayable variations per scene (2 routes each) and a small Codex of discoveries.
- Local save; i18n-ready (EN strings first).

Narrative Outline — Core Pack

- B1 Food Web at Home (Kitchen Garden)
    - Goal: show flows (water, nutrients, compost) and feedback loops.
    - Hotspots: sink, compost bin, herb pot, rain jar, poster.
    - Mini-puzzle: assemble a loop (drag arrows to complete: kitchen → compost → soil → herbs → kitchen).
    - Choice: prioritize “save water” vs. “grow herbs” emphasis; sets `b1.focus`.
- B2 Transit Rhythm (Neighborhood Map)
    - Goal: show schedules, bottlenecks, alternative routes.
    - Hotspots: bus stop, bike lane, crosswalk signals, map pins.
    - Mini-puzzle: plan a safe trip by sequencing 3 steps; or rebalance a timetable.
    - Choice: pick route A (bus-first) or B (bike-first); sets `b2.route`.
- B3 Waste Sorting (Community Corner)
    - Goal: flows and constraints (recycling vs. contamination).
    - Hotspots: bins, info board, two ambiguous items.
    - Mini-puzzle: drag items to correct bins; show “why” tips.
    - Choice: accept helper tips vs. go no-hints; sets `b3.noHints`.
- Wrap — Little Systems, Big Picture
    - Frame systems as connected stories; award a “Systems Scout” badge. Unlocks extensions in the Cards view.

Extensions (Replayable Content Packs)

- Space (Solar System)
    - S1 Orbits & Periods: arrange planets by orbital period; visualize resonances; kindness note: avoid doomsday
      tropes.
    - S2 Light & Shadows: phases and eclipses via 2D lamp-and-balls; accessibility: reduced-motion stills and captions.
    - S3 Habitable Clues: compare atmospheric hints (generic cards, no brands); moral: scientific humility.
- Ocean (Depth & Life)
    - O1 Layers of Light: order epipelagic → hadal; show adaptations with alt text.
    - O2 Currents & Climate: connect wind, currents, upwelling; empathy toward coastal communities.
    - O3 Deep Signals: match “pings/songs/lights” to creatures; captions and no-jumpscare rule.

Gameplay & UX

- DOM/CSS hotspots with keyboard support; 44px minimum targets; visible focus.
- Dialogue with 2–3 choices; no fail states, only different learnings.
- Tiny inventory (0–3 cards) used in puzzles.

Replayability Systems

- Per-scene alternate routes; daily shuffle option toggles evidence cards; medals: Bronze (complete), Silver (no hints),
  Gold (bonus discovery).
- Codex tracks discoveries and collectibles per pack.

Stack & Architecture

- Next.js 16, React 19; route `/games/systems-discovery` (client page uses dynamic import).
- Scene registry: `{ id, component, onEnter, next(state) }`.
- State: Context + reducer; localStorage key `sysdisc:save:v1`.
- Audio: soft ambient loops; optional SFX with captions.
- i18n: minimal `t()` util with EN JSON.

Data Model (sketch)

- `PackId = CORE | SPACE | OCEAN`
- `SceneId` per pack (e.g., `B1|B2|B3|WRAP`, `S1|S2|S3`, `O1|O2|O3`).
- Save:
  `{ pack, scene, flags: {b1:{focus}, b2:{route}, b3:{noHints}, space:{}, ocean:{}}, codex:{entries:string[]}, medals:{[sceneId]: 'bronze'|'silver'|'gold'} }`

Acceptance Criteria (Core + Packs ready for content wiring)

- Play through Core Pack end-to-end with accessible hotspots and save/restore.
- Each scene offers 2 routes; Codex updates on discovery; medals compute.
- Space and Ocean scenes render stubs and accept content; no broken links.

Implementation Tasks (summary)

- Scaffolding: package, manifest entry (upcoming), route, scene controller, save/load.
- Content: B1 loop puzzle; B2 route planner; B3 sorting; Space S1–S3, Ocean O1–O3 stubs.
- Accessibility: focus, captions, reduced motion.
- Testing: Playwright smokes per pack; RTL for reducer and medals.

Moral & Sensitivity Guardrails

- Celebrate stewardship and curiosity; avoid fear mongering; depict communities respectfully; science humility notes.

Suggestions — Additional Scenarios

- Core pack add-ons: “Power at Home” (grid vs. battery), “Water In/Out” (home plumbing loop).
- Space: “Small Worlds” (asteroids/comets families), “Signals from Space” (light spectra cards, no speculation claims).
- Ocean: “Reef Helpers” (mutualism matches), “Seafloor Builders” (vents to carbonates; neutral tone).
