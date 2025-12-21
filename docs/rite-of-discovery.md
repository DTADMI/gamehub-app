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

### New Game+ — Mentor Mini (Sibling Helper)

- Unlock: Appears after finishing the Epilogue and earning `ep.badgeHelper = true`. Accessible from the episode card as
  “Mentor Mini (Help your sibling).” Replayable; routes unlock based on prior choices.
- Framing: You’re now a “helper.” Your younger sibling is going through their own rite of discovery. You coach them
  kindly, echoing the earlier puzzles without spoiling the magic.
- Duration: 3–5 minutes; 1 short interactive beat chosen dynamically from three echoes of S1–S3.
- Routes (auto‑selected by state, but player can replay to see others):
    - Tag Echo (S1): A gentle “find the match” moment using 2–3 gift‑tag shards. Focus = noticing patterns, not exposing
      secrets.
    - Note Echo (S2): Compare 2 letterforms with a “spot the similarity” overlay that celebrates observation.
    - Talk Echo (S3): Plan a cozy conversation timing (now vs. later) by arranging 3 “good moments” cards (e.g., after
      snack, during story time, weekend morning).
- State carry‑over mapping (affects copy, hint strength, and which route is offered first):
    - If `s1.askParent === true`, initial mentor copy leans toward model‑by‑asking rather than telling.
    - If `s2.keepNote === true`, the Note Echo is prioritized; hints emphasize “look closely together.”
    - If `s3.confrontNow === false`, the Talk Echo highlights patience and picking a gentle moment.
- Kindness & privacy guardrails: Never depict trickery. The “helper” role models empathy and timing, not “busting” a
  secret. Sibling agency is respected; outcomes are positive and cozy.
- Outcome: A small “Mentor” sticker added to the Codex; optional reflection lines. No fail states.

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

New Game+ additions (save v3 already covers 15+; extend with Mentor Mini keys):

- mentor: {
  unlocked: boolean // ep.badgeHelper earned
  seenRoutes: { tagEcho?: boolean; noteEcho?: boolean; talkEcho?: boolean }
  mentorStyle?: 'askFirst' | 'observeTogether' | 'planTiming' // derived from S1–S3 choices
  }

## File Layout (proposal)

- games/rite-of-discovery/src/RiteGame.tsx
- games/rite-of-discovery/src/state.ts
- games/rite-of-discovery/src/scenes/{S1_NightBefore,S2_ToothTradition,S3_ProofMoment,Epilogue}.tsx
- games/rite-of-discovery/src/ui/{Dialogue,Hotspot,Inventory}.tsx

New Game+ (Mentor Mini):

- games/rite-of-discovery/src/scenes/MM_MentorMini.tsx
- games/rite-of-discovery/src/ui/MentorTips.tsx

## Hotspot Schema (example)

- id, rect (percent-based), label (aria-label), onActivate(state, dispatch)

## Implementation Tasks (summary)

- Design & Narrative: tone 7–9, gentle-mode variants, finalize beats, write en.json
- Scaffolding: create package, add manifest entry (enable at ship), route /games/rite-of-discovery
- Systems: scene controller, Hotspot component, Dialogue, Save/Load service
- Content: S1 tag reassembly; S2 letter-match; S3 proof moment; Epilogue framing
- New Game+: Mentor Mini (Sibling Helper) — 1 dynamic echo (Tag/Note/Talk) driven by S1–S3 flags; add Mentor Tips UI
  overlay
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
- Mentor Mini unlocks after Epilogue, adapts to prior choices, is replayable to see alternate echoes, and preserves
  kindness/privacy guardrails

## Designer/Animator Brief (assets & delivery)

For detailed asset specifications (formats, sizes, naming, budgets, hand‑off checklist), see the dedicated brief:

- docs/rite-of-discovery-designer-brief.md

This brief is the single source of truth for art delivery. It also includes a full French mirror.

## 15+ Extensions

Two new, optional tracks extend Rite of Discovery for ages 15+ with fun, replayable, kindness‑centered scenarios. Both
tracks keep the project’s moral guardrails (no endorsement of unkind behavior) and emphasize engaging stories with
branching paths, collectibles, and a Codex.

### Track A — Mythologies & Pantheons (MythWays)

- Framing: Cultural Field Journal club. You and a small group of friends catalog artifacts, inscriptions, and oral
  histories with empathy and curiosity. Tone is respectful, witty, and humble.
- Design goal: Reveal similarities/differences across pantheons and how environment, geography, trade, and history shape
  deity roles (river/nile cycles, sea‑ice pragmatism, syncretism under empire, etc.).

First content pack (2 shorts + 1 long):

- A1 River of Two Lands (Egypt — Nile cycles)
    - Hooks: Flood markers (nilometer), grain barges, festival calendar.
    - Routes: (A) Seasonal cycles and fertility rituals vs. (B) Civic/administrative memory (temple records).
    - Twist: Discover an older pre‑dynastic marker; unlock “Cycles Remembered” Codex entry.
    - Collectible: `collect_nilometer.svg`; Badge: `badge_fertility_cycles.svg`.
- A2 Meeting of Winds (Norse or Inuit coastal communities)
    - Hooks: Weather bones, sail fragments, oral history about a storm.
    - Routes: (A) Maritime pragmatism → weather deities as navigational archetypes; (B) Oral tradition → spirits mapped
      to hazards.
    - Twist: Optional elder interview unlocks “Resilience” epilogue snippet.
    - Collectible: `collect_weather_bone.svg`; Badge: `badge_resilience.svg`.
- A3 Paths of Exchange (Greco‑Roman + Persian + Egyptian syncretism)
    - Hooks: Bilingual inscription, coinage, shared epithets (Isis/Demeter analogies; Hermes/Mercury; local protectors).
    - Routes: (A) Syncretic bridges (shared roles) vs. (B) Imperial adoption/administration of cults.
    - Twist: A traveling merchant’s ledger reveals pragmatic cross‑worship; unlock “Concordia” ending.
    - Collectible: `collect_bilingual_inscription.svg`; Badge: `badge_concordia.svg`.

Core systems (MythWays):

- Evidence sorter (cards for epithets/roles/contexts); Map/path assembly; Parallel‑inscription mini‑puzzle.
- Codex sections: Role Archetypes (e.g., sky, river, hearth), Syncretic Bridges (who maps to whom and why),
  Environmental Constraints.

Sensitivity & cultural guardrails:

- Use precise terminology; show intra‑cultural diversity; avoid caricatures and inappropriate sacred depictions.
- Center kindness and curiosity; invite comparisons, not hierarchies. Include notes on contested scholarship.

### Track B — Evolution & Nature (Origins)

- Framing: Origins Lab & Field Notes. You run playful lab simulations and field observations; humor is gentle and
  curious. Medals reward careful inference.
- Design goal: Explore the beauty of nature and the nuances of evolutionary theory with engaging, interactive cases.

First content pack (2 shorts + 1 long):

- O1 Island Shuffle (island biogeography)
    - Hooks: Island chain map, driftwood seeds, lizards/bird photos.
    - Routes: (A) Dispersal/drift/niche colonization vs. (B) Convergent evolution on separate islands.
    - Twist: Unlock a rare dispersal event card; Codex “Parallel Solutions.”
    - Collectible: `collect_fossil_feather.svg`; Badge: `badge_island_biogeography.svg`.
- O2 Patterns in Pollen (coevolution)
    - Hooks: UV flower images, pollinator morphologies, flowering calendar.
    - Routes: (A) Trait matching (tongue length vs. corolla depth) vs. (B) Landscape/phenology constraints.
    - Twist: Night‑blooming variant unlocks “Invisible Colors” epilogue.
    - Collectible: `collect_uv_filter.svg`; Badge: `badge_coevolution.svg`.
- O3 Tails, Songs, and Signals (sexual vs. natural selection)
    - Hooks: Spectrograms, tail length charts, predator density map.
    - Routes: (A) Predation risk vs. (B) Mate choice dynamics; balance models with sliders.
    - Twist: Balanced configuration unlocks a co‑author credit in a mock “Club Zine.”
    - Collectible: `collect_signal_card.svg`; Badge: `badge_selection_balance.svg`.

Core systems (Origins):

- Trait sliders + fitness landscape mini‑games; Phylogeny builder; Spot‑the‑adaptation.
- Codex sections: Mechanisms (mutation, selection, drift, gene flow), Patterns (convergence/divergence), Case Albums.

Kindness & scientific guardrails:

- Emphasize humility of inference; never mock wrong ideas; show how evidence updates beliefs.
- Clear separation of models vs. real data; cite examples generically without needing backend.

### Shared Stack & Alternatives (for both tracks)

- Chosen: Next.js 16 + React; DOM/CSS illustrated scenes + hotspots; Context + Reducer state; soundManager; i18n‑ready;
  localStorage `save:v3`.
- Alternatives: XState seam for longer chapters; Pixi/Phaser optional later for complex effects.
- Accessibility: keyboard/focus order; aria‑live updates; reduced‑motion support.

### Data Model (save v3)

```
version: 3
age15Confirmed: boolean
track: 'mythways' | 'origins' | null
caseId: string | null
endingId: string | null
medals: Record<string, 'bronze' | 'silver' | 'gold' | undefined>
collectibles: Record<string, boolean>
codex: Record<string, boolean>
```

Migration: v1/v2 → v3 preserves prior progress and adds defaults for new fields.

### Testing Strategy (15+ tracks)

- Playwright: age‑gate flow; branch A/B + twist per case; medals/codex unlock assertions.
- RTL: reducer v2→v3 migration; trait slider logic; evidence sorter rules.

### Acceptance (first packs per track)

- Each track ships: 2 short cases + 1 long case with ≥ 2 routes + 1 twist; medals + Codex unlock; E2E/RTL green.

## 12+ Extension update — fun, replayable, and kindness‑centered

Framing: a lighthearted “Junior Investigator Club” mini‑arc with short, witty cases that teach thinking tools through
play, not lectures. Each case has at least two distinct routes plus a twist ending; medals track replay (
Bronze/Silver/Gold). All scenarios center niceness and morality — players resolve confusion kindly and constructively.

Example cases (hooks → routes → twist):

- The Mystery Coupon (Anchoring + Framing) → (A) assemble receipt shards to reframe total cost; (B) mini‑experiment with
  sample items → twist epilogue “Price Detective”.
- The Echo Thread (Confirmation + Filter Bubbles) → (A) cross‑check sources collage; (B) respectful debate mini‑duel (
  avoid fallacies) → journalist side scene with enough “Media Lenses”.
- The Coin‑Flip Streak (Gambler’s Fallacy) → (A) simulate flips + histogram; (B) playful zine to defang superstition →
  co‑op mini‑game unlock.
- The Miracle Patch (Post Hoc + Placebo) → (A) A/B test with swapped patches; (B) timeline of alternate causes → team
  montage ending with “Coach’s Clipboard”.
- The Amazing Poster (Authority + Ad Hominem) → (A) credential stamping; (B) clean arguments of personal jabs → Town
  Hall celebration if prior cases cleared without fallacies.

Kindness guardrails:

- Respectful humor; no ridicule. Emphasize listening, empathy, and strengthening ideas rather than attacking people.

## 15+ Extensions — Mythologies & Evolution (design, branching, stack, data)

Two extensive, replayable tracks for ages 15+ that remain kind, moral, and engaging. Both reuse core systems (hotspots,
dialogue, Codex, collectibles, medals) and expand the data model to v3 saves.

### Track A — Mythologies & Pantheons (MythWays)

- Framing: Cultural Field Journal club. We document artifacts, inscriptions, and oral traditions. Goal: show how
  environmental, historical, and cultural constraints shape deity roles; compare similarities/differences and syncretism
  without ranking cultures.
- First content pack (2 shorts + 1 long):
    1) A1 River of Two Lands (Egypt — Nile cycles)
        - Hooks: Nilometer notches, flood calendars, grain barges.
        - Routes: (A) Seasonal cycles → fertility archetypes; (B) Civic memory → temple records/calendrics.
        - Twist: Pre‑dynastic marker → Codex “Cycles Remembered”.
        - Collectible/Badge: collect_nilometer.svg, badge_fertility_cycles.svg.
    2) A2 Meeting of Winds (Norse or Inuit coastal)
        - Hooks: Weather bones, sailwork, oral storm tale.
        - Routes: (A) Maritime pragmatism → weather deities as navigational archetypes; (B) Oral tradition → spirits
          mapped to hazards.
        - Twist: Elder interview epilogue “Resilience”.
        - Collectible/Badge: collect_weather_bone.svg, badge_resilience.svg.
    3) A3 Paths of Exchange (Greco‑Roman + Persian + Egyptian syncretism)
        - Hooks: Bilingual inscription, coinage, shared epithets.
        - Routes: (A) Syncretic bridges; (B) Administrative adoption of local cults.
        - Twist: Merchant ledger → “Concordia” ending.
        - Collectible/Badge: collect_bilingual_inscription.svg, badge_concordia.svg.
- Mini‑games: evidence sorter (role/epithet/context), inscription match‑up, route/path assembly on trade maps.
- Sensitivity: avoid caricatures; represent intra‑cultural diversity; annotate contested scholarship; emphasize empathy.

### Track B — Evolution & Nature (Origins)

- Framing: Origins Lab & Field Notes. Run light simulations and field observations to explore evolution’s nuance and
  beauty.
- First content pack (2 shorts + 1 long):
    1) O1 Island Shuffle (island biogeography)
        - Hooks: island chain map, driftwood seeds, lizard/bird snapshots.
        - Routes: (A) Dispersal/drift/niche; (B) Convergent evolution across islands.
        - Twist: rare dispersal event → Codex “Parallel Solutions”.
        - Collectible/Badge: collect_fossil_feather.svg, badge_island_biogeography.svg.
    2) O2 Patterns in Pollen (coevolution)
        - Hooks: UV flower images, pollinator morphologies, phenology calendars.
        - Routes: (A) Trait matching (tongue vs. corolla); (B) Timing/landscape constraints.
        - Twist: night‑blooming variant → “Invisible Colors”.
        - Collectible/Badge: collect_uv_filter.svg, badge_coevolution.svg.
    3) O3 Tails, Songs, and Signals (sexual vs. natural selection)
        - Hooks: spectrograms, tail length charts, predator density map.
        - Routes: (A) Predation risk tradeoffs; (B) Mate choice dynamics; an interactive balance mini‑game.
        - Twist: optimal balance unlocks “Club Zine” co‑author credit.
        - Collectible/Badge: collect_signal_card.svg, badge_selection_balance.svg.
- Mini‑games: trait sliders + fitness curves; phylogeny builder; spot‑the‑adaptation.
- Scientific guardrails: clarify model vs. data; emphasize humility; avoid dunking on “wrong” ideas.

### Stack (shared) & Alternatives

- Chosen: Next.js 16 + React 19; DOM/CSS hotspots; Context+Reducer state (seam for XState later); key‑based t() en.json;
  soundManager; localStorage v3 saves; Playwright + RTL.
- Alternatives: XState (explicit charts; more boilerplate). Pixi/Phaser (effects; heavier, a11y trade‑offs).

### Data model (save v3) & migration

- Fields: `age15Confirmed:boolean`, `track:'mythways'|'origins'|null`, `caseId`, `endingId`,
  `medals:Record<string,'bronze'|'silver'|'gold'>`, `collectibles:Record<string,boolean>`,
  `codex:Record<string,boolean>`.
- Migration: v1/v2 → v3 preserving prior progress; default new fields.

### File layout additions

- `games/rite-of-discovery/src/tracks/mythways/cases/{A1_RiverTwoLands,A2_MeetingWinds,A3_PathsOfExchange}.tsx`
- `games/rite-of-discovery/src/tracks/origins/cases/{O1_IslandShuffle,O2_PatternsInPollen,O3_TailsSongsSignals}.tsx`
- `games/rite-of-discovery/src/systems/{evidenceSorter,traitSliders,phylogeny}.tsx`
- `games/rite-of-discovery/src/state.migrations.ts` (v1/v2 → v3)

### Testing & Acceptance (per track, first release)

- Playwright: age‑gate → case select → branch A/B → twist ending; Codex/collectibles/medals unlocks; reduced‑motion alt
  present.
- RTL: reducer migrations; evidence sorter rules; trait slider math.
- Acceptance: 2 short + 1 long case per track; ≥2 routes + 1 twist each; Codex/medals wired; E2E/RTL green; a11y basics
  verified.

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
