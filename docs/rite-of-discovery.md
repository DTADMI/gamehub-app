# Rite of Discovery — Point-and-Click MVP (Design Doc)

This document was moved from `guidelines.md` to keep guidelines focused. It contains the story, gameplay, stack, and
implementation plan for the new point-and-click game.

## Overview

Short, gentle adventure for ages 7–9 about discovering that traditions like Santa and the Tooth Fairy are family-made
magic. The ending frames it as a rite of passage.

## MVP Goals

- 8–12 minutes, 3 scenes + epilogue
- Clickable hotspots, simple micro-puzzles, light dialogue
- Gentle mode toggle (softer wording)
- Local save; i18n-ready strings (English only)
- Extensible scenes/chapters

## Narrative Outline (MVP)

- Scene 1 — Night Before (Living Room)
    - Goal: introduce curiosity; teach interaction
    - Hotspots: wrapping paper roll, tape dispenser, gift tag, cookie plate, fireplace
    - Micro-puzzle: reassemble torn tag (drag 3 pieces); success reveals handwriting matching a parent’s note
    - Choice: keep suspicion private vs. ask leading question; sets flag s1.askParent
    - Gentle copy: “maybe helpers?” vs. explicit “parents write tags”
- Scene 2 — Tooth Tradition (Kid’s Bedroom)
    - Goal: pattern recognition via keepsake box/note
    - Hotspots: pillow, nightstand drawer, keepsake box, squeaky floorboard (SFX), window
    - Micro-puzzle: compare letters on two notes (spot-the-difference, click 3 matches)
    - Choice: take the note vs. leave it; sets s2.keepNote
- Scene 3 — Store or Attic (Proof Moment)
    - Goal: gently confirm family tradition; overheard planning or find a receipt
    - Hotspots: storage bin, receipt, phone on speaker (muffled), closet/attic door
    - Dialogue: overhear “pick up the costume”/“hide the gift”; gentle mode avoids direct terms
    - Choice: confront now vs. save it for later; sets s3.confrontNow
- Epilogue — Rite of Discovery
    - Parents invite conversation; frame it as a rite of passage where kids eventually outsmart the grown-ups
    - Player choices reflect in tone: proud/celebratory vs. cozy/affirming
    - Unlock a small ‘Helper Badge’ and optional credits page

## Gameplay & UX

- Hotspots with clear focus/hover, keyboard accessible
- 2–3 dialogue options; no fail states
- Tiny inventory (0–3 items)
- Save in localStorage; restore on reload
- Accessibility: captions, readable text, visible focus, reduced motion support

## Stack & Architecture

- Next.js 16, React 19 (client page under /games/rite-of-discovery)
- Rendering: DOM + CSS hotspots (no heavy engine); 16:9 illustrated scenes as background images in a responsive
  container
- Scene system: lightweight controller with a registry { id, component, onEnter, next(sceneState) }
- State: React Context + reducer (scene, flags, inventory, choices, gentle), seam for XState later
- i18n: i18next (client) or tiny t() util with structured message keys; English bundle en.json
- Audio: reuse soundManager (ambient loop per scene + click/creak SFX)
- Persistence: localStorage via save(versionedState)/loadOrInit(); storage key rod:save:v1
- Testing: Playwright E2E (scene progression, gentle toggle), RTL for reducers and hotspot logic

## Technical Choices & Alternatives (pros/cons)

- Rendering
    - DOM/CSS hotspots (chosen): Pros: light, accessible, easy to test. Cons: fewer visual effects.
    - Pixi/Phaser (alternative): Pros: robust scene graph and effects. Cons: heavier bundle, less accessible.
- State management
    - React Context + reducer (chosen): Pros: simple, minimal overhead. Cons: fewer explicit diagrams.
    - XState (alternative seam): Pros: explicit statecharts. Cons: extra dependency.
- i18n
    - Minimal t() + JSON (chosen): Pros: minimal; easy to wire. Cons: fewer advanced features.
    - i18next (alternative): Pros: robust. Cons: more setup.
- Persistence
    - localStorage v1 (chosen): Pros: offline; trivial. Cons: single-device only.
    - Backend sync (future): Pros: cross-device. Cons: requires API and auth.

## Data Model (sketch)

- SceneId = S1 | S2 | S3 | EPILOGUE
- GameState fields: scene, gentle, flags, inventory, choices, version=1

## File Layout (proposal)

- games/rite-of-discovery/src/RiteGame.tsx
- games/rite-of-discovery/src/state.ts
- games/rite-of-discovery/src/scenes/{S1_NightBefore,S2_ToothTradition,S3_ProofMoment,Epilogue}.tsx
- games/rite-of-discovery/src/ui/{Dialogue,Hotspot,Inventory}.tsx

## Hotspot Schema (example)

- id, rect (percent-based), label (aria-label), onActivate(state, dispatch)

## Implementation Tasks (summary)

- Design & Narrative: tone 7–9, gentle-mode variants, finalize beats, write en.json
- Scaffolding: create package, add manifest entry (enable at ship), route /games/rite-of-discovery
- Systems: scene controller, Hotspot component, Dialogue, Save/Load service
- Content: S1 tag reassembly; S2 letter-match; S3 proof moment; Epilogue framing
- Art & Audio: 3–4 illustrated 16:9 scenes (WEBP/AVIF) + light parallax; ambient loop per scene; click/creak SFX
- Accessibility: focus, keyboard traversal, aria-live; captions for any voiced SFX
- Persistence & Telemetry: persist on scene/choice; optional analytics (consent-gated)
- Testing: Playwright S1→S2→S3→Epilogue + gentle toggle; RTL for reducers/saves/hotspots
- Ship: enable in manifest (Featured follows Playable==Featured), add catalog card, update README

## Acceptance Criteria

- MVP is playable end-to-end with gentle-mode toggle
- Backgrounds and hotspots are accessible; focus management verified
- Local save works; reload resumes the latest scene
- E2E and key unit tests are green

---

## Post‑MVP Roadmap (Episodic + Branching)

Audience modes (with parental consent):

- Gentle (7–9): softer wording; suggestive hints.
- Standard (8–10): neutral wording; slightly higher puzzle complexity.
- Older (9–11): clearer wording; optional extra steps.

Structure: ship 5–8 minute episodes with replayable branches and optional side scenes.

Episodes (first wave):

- Episode A — Winter Traditions
    - A1 Gift Closet Diversion (stealthy hotspot route)
    - A2 Neighborhood Lights Errand (neighbor NPC; optional hint path)
    - A3 Fireplace Prep Redux (advanced tag puzzle)
- Episode B — Tooth Tradition Variants
    - B1 Dentist Visit (light humor interlude)
    - B2 Lost Tooth Mystery (4–5 piece note assembly)
- Episode C — Proof Alternatives
    - C1 Receipt Trail vs. Calendar App (paper vs. digital proof)
    - C2 Overheard Phone Call vs. Costume Storage (mutually exclusive)
- Episode D — Side Stories
    - D1 Sibling Ally/Prankster path (badge unlock)
    - D2 Family Traditions Gallery (Codex; collectibles)

Systems (foundation for Post‑MVP):

- Parental consent + Age/Tone selector (Gentle/Standard/Older); persisted in localStorage.
- Episode loader and 3 save slots; autosave on scene transition; versioned save (v2) with migration from v1.
- Branching flags per episode; endings summary screen; replay map UI.
- Collectibles + Journal/Codex: unlock entries and badges.
- Difficulty scaling (Easy/Normal/Challenger): adjusts piece counts, hints, retries.

Acceptance (Post‑MVP first release):

- Episodes A and B playable with ≥1 major branch each.
- Age/Tone selector present and persistent; toggleable in settings.
- Save v2 + slots functional; replay map visible.
- Collectibles (≥3 total) and Codex unlocks present.
- E2E flows (branches, toggles, collectibles) + RTL reducer/saves are green.

---

## Asset Guidelines & Art Pipeline (Designer/Animator)

Art direction: warm, cozy, grounded; soft edges; accessible contrast.

Formats & sizes:

- Backgrounds: AVIF preferred (WEBP fallback); 2560×1440 and 1920×1080; names `ep<LETTER>_scene<N>_bg.avif`.
- Foreground props/overlays: SVG preferred (PNG 2× fallback); names `ep<LETTER>_scene<N>_<prop>.svg`.
- Icons/collectibles/badges: SVG (256×256 PNG fallback): `collect_<id>.svg`, `badge_<id>.svg`.
- Optional animation: light Lottie JSON or PNG sequences (≤200KB/loop, ≤6s, low amplitude).

Delivery path:

- `public/games/rod/assets/epA/`, `epB/`, `epC/`, `epD/`, and `shared/`.

Safe areas & layers:

- Keep critical details away from outer 5% (responsive crop).
- Optional layered BG: `bg_base`, `bg_mid`, `bg_fore` for parallax; ship flat BG as fallback.
- Separate hotspot props for highlight/hover/micro‑motion.

Episode‑specific asset checklists:

- Episode A: living room + hallway/closet BGs; gift tag pieces (3–5); tape/roll/cookie/handle/box‑lid/receipt;
  `collect_ornament.svg`, `badge_confidence.svg`; optional candle flicker/twinkle/snow.
- Episode B: bedroom + dentist BGs; keepsake box lid; note (A/B variants); floorboard/drawer; note pieces (4–5);
  `collect_tooth_charm.svg`, `badge_curious.svg`; optional nightlight glow/mobile sway.
- Episode C: store/attic + kitchen BGs; receipt, calendar icon, costume bag, phone speaker; `collect_ribbon.svg`,
  `badge_detective.svg`; optional dust motes/notification pulse.
- Episode D: sibling room/backyard + gallery BGs; journal frame/tabs; `badge_teamwork.svg`, `badge_helper.svg`.

Global UI assets (optional): age/tone icons (`ui_mode_*`), episode card overlays, dialog portraits.

Technical targets:

- Total BG payload per episode ≤ 800KB (brotli). Prop SVG ≤ 30KB (goal <10KB). Respect `prefers-reduced-motion`.

Hand‑off per episode:

1) BGs at 2560×1440 (AVIF + WEBP). 2) Prop SVGs per puzzle spec. 3) Collectible + badge SVGs. 4) Optional Lottie/notes.
   5) Hotspot mock with suggested placements. 6) Gentle vs Standard copy notes where relevant.

---

## 12+ Extension — “Thinking Tools” (Rationality & Biases)

Goal: a replayable, extensive extension for ages 12+ that gently teaches rational thinking, common cognitive
biases/fallacies, and practical debiasing strategies through interactive vignettes.

Tone & framing:

- Supportive, non‑judgmental; “toolbox” framing. No shaming for mistakes; encourage exploration and retries.

Core mechanics:

- Scenario vignettes (2–4 minutes each) with branching dialogue/choices.
- “Bias spotted” moments: player identifies a bias or proceeds to see consequences; optional hints.
- Debias actions: prompts to apply strategies (e.g., reframe, seek base rates, consider alternative hypotheses).
- Reflection cards: unlock short summaries (Codex entries) after each vignette; stack into a “Thinking Tools” set.

Curriculum map (initial set):

- Evidence & Beliefs: confirmation bias, motivated reasoning; strategy: steel‑man opposing view, checklist for
  disconfirming evidence.
- Probability & Base Rates: base‑rate neglect; strategy: anchor with prior/base rates.
- Causality & Correlation: post hoc fallacy; strategy: alternative explanations, control variables.
- Framing & Loss Aversion: risk preference shifts; strategy: reframe to absolute numbers.
- Social Proof & Authority: appeal to authority; strategy: evaluate source, triangulate.
- Availability & Recency: availability heuristic; strategy: sample size, seek representative data.

Replayability & mastery:

- Multiple paths per vignette; mastery badges for identifying biases and applying strategies across runs.
- Difficulty tiers: Easy (guided hints), Normal (occasional nudges), Expert (minimal hints; timed choices optional).

Integration with base game:

- Lives under the same launcher as an advanced module (requires 12+ confirmation / parental consent when applicable).
- Shares systems: save slots v2, Codex/Journal (Thinking Tools section), collectibles/badges.

Acceptance (first Thinking Tools pack):

- ≥ 6 vignettes covering the above topics, each with at least two significant branches and a debias action.
- “Thinking Tools” Codex with unlocked entries and mastery badges.
- Difficulty selector + hint system; E2E flows and RTL unit tests for reducer/flags.
