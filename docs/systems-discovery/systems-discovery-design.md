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

  - Body Systems (Human Biology) — multi‑sub‑pack with Homeostasis Meter
    - Overview
      - Age framing: 9–12 primary with optional 15+ “Deeper Science” toggles in captions/tooltips.
      - Structure: multiple themed sub‑packs, each with 3 scenes + a wrap screen and a shared Homeostasis Meter that
        reacts to choices.
      - Tone & guardrails: educational, kind, body‑positive, culturally neutral; strictly schematic/abstract art; no
        gore; reproductive topics handled with scientific clarity and consent framing.
    - Sub‑packs
      - BOD‑Breath (Respiration & Circulation)
        - BB1 Respiratory Basics: air path and gas exchange (lungs → alveoli → blood).
        - BB2 Cardiovascular Flow: heart chambers and flow directions (icons only).
        - BB3 Coupling at the Exchange: match oxygen/carbon dioxide flow; meter responds to balanced choices.
      - BOD‑Fuel (Digest, Absorb, Excrete)
        - BF1 Digestive Journey: break foods into nutrients; enzyme cards (generic).
        - BF2 Absorption & Transport: small intestine villi → bloodstream; liver/pancreas cameo.
        - BF3 Waste & Balance: urinary system overview; hydration choices affect meter.
      - BOD‑Move (Frame & Motion)
        - BM1 Skeletal Support: bones as levers; joints and safety.
        - BM2 Muscular Action: antagonistic pairs; stamina vs. strength choices.
        - BM3 Coordination: nervous system sends motor signals; reaction mini‑game (reduced‑motion stills provided).
      - BOD‑Signal & Defend (Sense, Signal, Protect)
        - BSD1 Nervous & Senses: signal pathways; senses as input cards (sound/light/pressure/chemical).
        - BSD2 Endocrine Messages: hormones as slow signals; balance concepts (sleep, energy, growth).
        - BSD3 Immune & Lymphatic + Integumentary: barriers and defenders; match threat→response (neutral imagery).
      - BOD‑Grow (Development & Care)
        - BG1 Reproductive Basics: cells and growth story (gametes→zygote→embryo) with schematic iconography only.
        - BG2 Changes Over Time: puberty and growth framed with consent/care; hormones connect back to endocrine.
        - BG3 Care Networks: community and healthcare roles; consent/choice; social safety lens.
    - Mechanics
      - Per‑scene mini‑puzzles (order, match, assemble) plus cross‑scene challenges (e.g., “keep the Homeostasis Meter
        in the green for all 3 scenes”).
      - Meter: 0–100 scale with calm, non‑alarmist feedback; never punishes, only teaches balance trade‑offs.
    - Accessibility
      - Clear, abstract visuals; alt text for diagrams; captions for SFX; reduced‑motion stills for any animation.
    - Acceptance (Body Systems)
      - All five sub‑packs playable end‑to‑end with save/restore; meter persists within each sub‑pack; wrap awards
        badges.
      - Deeper Science toggles surface safe, age‑appropriate details without changing puzzle difficulty.

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
  - 15+ toggles: `showDeeperScience` flag gates additional captions/tooltips.

Intro/Outro Beats (implemented)

- Intro scene `SD_INTRO` (title card): sets `intro.seen=true` on first visit, then proceeds to `B1`. Skipped on
  subsequent runs.
- Outro scene `SD_OUTRO` (wrap after WRAP): shows recap and replay hooks; sets `outro.seen=true`. Can be opened from
  WRAP via a link.
- Replay hooks (low-scope): quick restart of Core pack, alternate B2 plan quick-start, toggle hints for next run.

Flow & Narrative Sequencing — Core and Extensions

- Core pack (first run)
  - SD_INTRO (first visit only) → B1 (Loop) → B2 (Planner) → B3 (Sorter) → WRAP (badge) → SD_OUTRO (first completion
    only)
  - Flags: `intro.seen`, `b1.route`, `b2.plan`, `b3.hints`, `b3.result`, `outro.seen`
  - Replay hooks: from WRAP or SD_OUTRO, offer Replay Core, Alternate B2 plan, Toggle B3 hints
- Space pack
  - SD_SPACE_INTRO (first visit only) → S1 → S2 → S3 → Space WRAP → SD_SPACE_OUTRO (first completion only)
  - Flags: `flags.space.intro.seen`, `flags.space.outro.seen`
- Ocean pack
  - SD_OCEAN_INTRO (first visit only) → O1 → O2 → O3 → Ocean WRAP → SD_OCEAN_OUTRO (first completion only)
  - Flags: `flags.ocean.intro.seen`, `flags.ocean.outro.seen`
- Body Systems (BOD) sub‑packs
  - For each sub‑pack (Breath, Fuel, Move, Signal & Defend, Grow): `SD_BOD_<SUB>_INTRO` → three scenes → `<SUB> WRAP` →
    `SD_BOD_<SUB>_OUTRO`
  - Shared meter: `bod.meter` persists within sub‑pack; flags include `flags.bod.<sub>.intro.seen` /
    `flags.bod.<sub>.outro.seen`

Narrated journey (Core)

On a first visit, a friendly SD_INTRO title card invites the player to begin. In B1, the kitchen scraps become compost,
which enriches soil that feeds herbs back in the kitchen—a small loop the player completes step by step. In B2, they
choose between taking the bus first or biking first to plan a safe trip; either plan works and records their choice. In
B3, the player sorts everyday items, optionally turning hints on for supportive guidance. The WRAP screen celebrates the
Systems Scout badge and recaps choices. The first time, SD_OUTRO appears with calm congratulations and simple replay
options—try the alternate route, toggle hints, or replay the Core pack—keeping the tone curious and kind while setting
up future Space, Ocean, and Body Systems explorations.

Extensions — Intro/Outro Beats (now documented)

- Space pack
  - Intro scene `SD_SPACE_INTRO` (title card): first visit only; sets `flags.space.intro.seen=true`; proceeds to Space
    S1. Keys: `sysdisc.space.intro.*`.
  - Outro scene `SD_SPACE_OUTRO` (after Space wrap): recap + replay; sets `flags.space.outro.seen=true`. Keys:
    `sysdisc.space.outro.*`.
- Ocean pack
  - Intro scene `SD_OCEAN_INTRO`: sets `flags.ocean.intro.seen=true`; proceeds to Ocean O1. Keys:
    `sysdisc.ocean.intro.*`.
  - Outro scene `SD_OCEAN_OUTRO`: sets `flags.ocean.outro.seen=true`. Keys: `sysdisc.ocean.outro.*`.
- Body Systems (BOD) sub‑packs
  - Each sub‑pack has its own intro/outro scenes (title cards, low‑scope, text‑first):
    - Breath: `SD_BOD_BREATH_INTRO` / `SD_BOD_BREATH_OUTRO`; flags `flags.bod.breath.intro.seen`,
      `flags.bod.breath.outro.seen`; keys `sysdisc.bod.breath.*`.
    - Fuel: `SD_BOD_FUEL_INTRO` / `SD_BOD_FUEL_OUTRO`; flags `flags.bod.fuel.intro.seen`, `flags.bod.fuel.outro.seen`;
      keys `sysdisc.bod.fuel.*`.
    - Move: `SD_BOD_MOVE_INTRO` / `SD_BOD_MOVE_OUTRO`; flags `flags.bod.move.intro.seen`, `flags.bod.move.outro.seen`;
      keys `sysdisc.bod.move.*`.
    - Signal & Defend: `SD_BOD_SIGNAL_INTRO` / `SD_BOD_SIGNAL_OUTRO`; flags `flags.bod.signal.intro.seen`,
      `flags.bod.signal.outro.seen`; keys `sysdisc.bod.signal.*`.
    - Grow: `SD_BOD_GROW_INTRO` / `SD_BOD_GROW_OUTRO`; flags `flags.bod.grow.intro.seen`, `flags.bod.grow.outro.seen`;
      keys `sysdisc.bod.grow.*`.

Notes

- All extension intros/outros follow the same accessibility and reduced‑motion guidance as Core title cards. They are
  skippable and discoverable via links on wrap screens.

Acceptance additions (Core)

- First run shows `SD_INTRO`; subsequent runs skip intro automatically. WRAP exposes link to view `SD_OUTRO` once and
  thereafter on demand.
- Flags persisted in save: `intro.seen`, `outro.seen`, plus existing `b1.*`, `b2.plan`, `b3.*`.

Launcher exposure & flags (Body Systems)

- Frontend-only flags (stored under `gh:flags:v1`) control whether Body Systems appears in the `/games` catalog as a
  dedicated card.
- Deep-links allow starting a sub‑pack directly: `/games/systems-discovery?pack=breath|fuel|move|signal|grow`. The game
  reads the `pack` query parameter and starts at the corresponding `SD_BOD_<SUB>_INTRO` scene.
- Core WRAP no longer includes temporary BOD entry buttons to keep the wrap uncluttered.

Accessibility notes (BOD diagrams & meter)

- Use descriptive `alt` text for diagrams and labels/patterns in addition to color. The shared Homeostasis Meter exposes
  ARIA `role="meter"` with `aria-valuemin/max/now` and a readable label.

Data Model (sketch)

- `PackId = CORE | SPACE | OCEAN | BOD_BREATH | BOD_FUEL | BOD_MOVE | BOD_SIGNAL | BOD_GROW`
- `SceneId` per pack (e.g., `B1|B2|B3|WRAP`, `S1|S2|S3`, `O1|O2|O3`, `BB1|BB2|BB3|WRAP`, ...).
- Save:
  `{ pack, scene, flags: {b1:{focus}, b2:{route}, b3:{noHints}, space:{}, ocean:{}, bod:{ meter:number, toggles:{deeper:boolean} } }, codex:{entries:string[]}, medals:{[sceneId]: 'bronze'|'silver'|'gold'} }`

Acceptance Criteria (Core + Packs ready for content wiring)

- Play through Core Pack end-to-end with accessible hotspots and save/restore.
- Each scene offers 2 routes; Codex updates on discovery; medals compute.
- Space and Ocean scenes render stubs and accept content; no broken links.

Implementation Tasks (summary)

- Scaffolding: package, manifest entry (upcoming), route, scene controller, save/load.
- Content: B1 loop puzzle; B2 route planner; B3 sorting; Space S1–S3, Ocean O1–O3 stubs.
- Body Systems content scaffolds: add five sub‑packs with 3 scenes each (BB1–3, BF1–3, BM1–3, BSD1–3, BG1–3),
  Homeostasis Meter UI, wrap screens.
- Accessibility: focus, captions, reduced motion.
- Testing: Playwright smokes per pack; RTL for reducer and medals.

Moral & Sensitivity Guardrails

- Celebrate stewardship and curiosity; avoid fear mongering; depict communities respectfully; science humility notes.

Suggestions — Additional Scenarios

- Core pack add-ons: “Power at Home” (grid vs. battery), “Water In/Out” (home plumbing loop).
- Space: “Small Worlds” (asteroids/comets families), “Signals from Space” (light spectra cards, no speculation claims).
- Ocean: “Reef Helpers” (mutualism matches), “Seafloor Builders” (vents to carbonates; neutral tone).
- Body Systems: “Sleep & Circadian” (link endocrine+nervous), “Microbiome Buddies” (digestive symbiosis, neutral icons),
  “First Aid Basics” (barrier care, social safety), “Sports & Recovery” (move+fuel balance).
