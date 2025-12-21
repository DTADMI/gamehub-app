# GameHub Action Plan

## Project Overview

GameHub is a Next.js 16 frontend application that serves as a platform for playing web games and browsing projects. It's
designed to be backend-agnostic, communicating with a separate API service.

## Completed Tasks

- [x] Set up Next.js 16 project with TypeScript
- [x] Configured Tailwind CSS v4 for styling
- [x] Integrated shadcn/ui component library
- [x] Set up authentication with NextAuth.js
- [x] Implemented OAuth providers (Google, GitHub)
- [x] Created basic project structure and routing
- [x] Set up Playwright for end-to-end testing
- [x] Configured CI/CD with GitHub Actions
- [x] Set up deployment to Google Cloud Run
- [x] Added Breakout game with boosters and particles
- [x] Added Memory game
- [x] All 7 MVP games playable and featured (Breakout, Memory, Snake, Knitzy, Bubble Pop, Checkers, Chess)
- [x] Background re‑looking — galaxy (dark) and star‑glow (light) backgrounds implemented with fallbacks for browsers
  without OKLCH/color-mix support
- [x] Section separators softened for seamless layout; backgrounds made clearly visible again (header/footer
  translucent);
  game cards normalized to consistent heights while remaining responsive
- [x] Featured alignment — Playable == Featured (single source: games/manifest.ts); Home shows Featured Games and
  Featured Projects only; Games page lists all games with green Featured and yellow Upcoming badges; images overlaid
  from lib/games.ts when present
- [x] Knitzy rename — current MVP renamed to “Pattern Matching” (playable); new “Knitzy” entry added as Upcoming;
  redirect /games/knitzy → /games/pattern-matching; E2E updated

## In Progress

### Point & Click Track — Status Overview (Finish ROD → then TME → then SD)

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

- ✅ Common Systems (shared engine)
  - ✅ Scene/Room controller (registry + onEnter/next) — implemented in `games/_engine`
  - ✅ Hotspot component (ARIA, keyboard, focus, data-testid) — `HotspotButton`
  - ✅ Dialogue/Prompt UI with 2–3 choices — `ChoiceList`
  - ✅ Save/Load service (localStorage v1; per‑game keys: `rod:save:v1`, `sysdisc:save:v1`, `tme:save:v1`)

---

✅ Rite of Discovery — Finish Beta NOW (priority 1)

- Content & Puzzles
  - [x] Implement S1 tag reassembly mini (3 pieces; keyboard + pointer)
  - [x] Implement S2 note letter‑match (3 differences; clear/high‑contrast targets)
  - [x] Implement S3 proof moment branch (receipt vs. overhear) with flags saved
  - [x] Epilogue screen; Helper Badge unlock; NG+ gate visible
- Systems & UX
  - [x] Gentle Mode copy toggles applied to all dialogue prompts
  - [x] Inventory placeholder (0–3 items) with labels and focus order
  - [x] Save migration guard (v1 → v1, no‑op; add future‑proof version field)
- Accessibility
  - [x] 44px targets; visible focus; reduced‑motion stills for animations
  - [x] Captions container present; basic contrast check completed
- Content Ops
  - [x] Strings extracted to en.json namespace `rod.*` (i18n‑ready)
  - [x] Minimal final art placeholders wired (BG, 2 props, badge SVG)
- QA & Tests
  - [x] Playwright: complete S1→EP on both branches of S3
  - [x] RTL: save/load, flags, gentle‑mode toggle logic
- Acceptance (Beta)
  - [x] Beta complete and shippable: accessibility pass, E2E/RTL green, minimal final assets in place

---

🔜 Toymaker Escape — Beta Ship Checklist (priority 2; start after ROD Beta)

- Content & Puzzles (E1)
  - [ ] Implement Workshop mini: Gear alignment OR Music box (one route required)
  - [ ] Implement Playroom sorter to reveal Key Fragment 1
  - [*] Episode complete screen + Codex seed (stubbed in alpha)
- Systems & UX
  - [ ] Inventory (0–6 items) basic; draggable puzzle pieces for one mini
  - [ ] Medal tally (bronze/silver/gold) — simple criteria for E1 only
- Accessibility
  - [ ] Keyboard traversal for sliders/rotations; reduced‑motion variants
  - [ ] SFX captions and volume control exposed
- Content Ops
  - [ ] Strings extracted to en.json namespace `tme.*`
  - [ ] Minimal final art placeholders (Workshop BG, Playroom BG, Key fragment SVG)
- QA & Tests
  - [ ] Playwright: finish E1 via both gear and music routes
  - [ ] RTL: reducer for medals, inventory add/remove
- Acceptance (Beta)
  - [ ] E1 fully playable with accessibility pass; tests green; minimal art in place

---

🗂️ Systems Discovery — Beta Ship Checklist (priority 3; start after TME Beta)

- Content & Puzzles (Core)
  - [ ] Implement B1 loop puzzle (Kitchen→Compost→Soil→Herbs)
  - [ ] Implement B2 route planner (Bus/Bike sequence)
  - [ ] Implement B3 waste sorting with hints toggle
  - [*] Wrap screen + Systems Scout badge (stubbed in alpha)
- Systems & UX
  - [ ] Simple map/list UI components shared across scenes
  - [ ] Save fields validated; medal or badge attribution on WRAP
- Accessibility
  - [ ] 44px targets; colorblind‑safe icons/patterns for sorting
  - [ ] Reduced‑motion stills for any animated transitions
- Content Ops
  - [ ] Strings extracted to en.json namespace `sysdisc.*`
  - [ ] Minimal final art placeholders (1 BG, 3 icons, badge SVG)
- QA & Tests
  - [ ] Playwright: complete B1→WRAP with both B2 plans
  - [ ] RTL: hint toggle logic; save/read flags
- Acceptance (Beta)
  - [ ] Core pack fully playable with accessibility pass; tests green; minimal art in place

---

Cross‑Game Tasks (apply in this order: ROD → TME → SD)

- Testing
  - [ ] Playwright smokes: reach end of MVP/Beta for each game
  - [ ] RTL: reducers and save/load per game
- Accessibility
  - [ ] Global audit: focus order, target sizes, color contrast, reduced motion
  - [ ] Captions for any SFX; verify with screen reader basic paths

---

### Immediate Execution Order (per “Finish ROD now, then TME, then SD”)

1) Rite of Discovery — finish Beta
  - [ ] Extract strings to `en.json` under `rod.*`
  - [ ] Wire minimal final art placeholders (BG, 2 props, badge SVG)
  - [ ] Add Playwright flows (two S3 branches) and RTL tests (save/load, gentle)
  - [ ] Quick a11y contrast check and SFX captions container (no new audio)
  - [ ] Mark Acceptance (Beta) as complete

2) Toymaker Escape — implement E1 Beta
  - [ ] Build Workshop route (gears or music) and Playroom sorter minis
  - [ ] Inventory basics and simple medal tally
  - [ ] Extract strings to `tme.*`; add Playwright/RTL
  - [ ] A11y pass (keyboard sliders/rotations; reduced‑motion)
  - [ ] Mark Acceptance (Beta) as complete

3) Systems Discovery — implement Core Beta
  - [ ] Build B1 loop, B2 route planner (two solutions), B3 sorter with hints
  - [ ] Extract strings to `sysdisc.*`; shared UI bits; wrap badge
  - [ ] A11y pass; Playwright/RTL
  - [ ] Mark Acceptance (Beta) as complete

#### Post‑MVP — Systems Discovery: Body Systems Pack (documentation + scaffolds)

- Docs & design
  - [x] Extend design doc with Body Systems overview, sub‑packs, Homeostasis Meter, data model, acceptance, tasks
  - [x] Update Designer Brief (EN+FR) with BOD asset templates and delivery paths
    `assets/{core|space|ocean|bod|shared}/`
  - [x] Add stories tracker entries for BB1–3, BF1–3, BM1–3, BSD1–3, BG1–3 (goals, hooks, beats, flags, guardrails)
- Engineering scaffolds
  - [ ] Add Homeostasis Meter UI component (ARIA, reduced‑motion stills)
  - [ ] Add five BOD sub‑packs to scene registry (stubs for BB/BF/BM/BSD/BG with wrap screens)
  - [ ] Extend save model `sysdisc:save:v1` with `bod: { meter:number, toggles:{deeper:boolean} }`
  - [ ] Medal rules: award “Care Ally”/BOD sub‑pack badges on wrap
- Accessibility & testing
  - [ ] Alt text and captions for all new diagrams; colorblind‑safe patterns for O2/CO2 and flows
  - [ ] Playwright smoke: complete one BOD sub‑pack (any 3 scenes + wrap) with meter staying green

- [x] Backgrounds — visibility fix and verification (galaxy dark, star‑glow light); ensure `--app-bg` applied on all
  pages (tuned intensities, enhanced starfield/nebula; verified on home, catalog, and game pages)
- [ ] Game Launcher — Phase 2: flags‑driven gating via frontend‑only flags provider (localStorage) with unit/E2E checks
- [ ] Breakout particles reliability — ensure normal brick‑hit emissions and live effect switching; hide particle
  controls in non‑particle games
- [ ] Snake mobile controllers — Swipe (default), optional Joystick/D‑pad and Taps; non‑blocking scroll; mobile E2E
- [ ] Memory game UX — matched cards spin+fade then are removed from layout after animation; add tests
- [ ] Assets & backgrounds — wire initial Kenney SFX and backgrounds; maintain public/credits.md
- [ ] Documentation — keep README and guidelines updated with Admin/Launcher/Snake controls
- [ ] Add user profile and game statistics tracking
- [ ] Implement leaderboard functionality
- [ ] Implement game settings and preferences

### MVP Playables Track (completed)

- All four newly added playables are complete with E2E smokes:
  - Knitzy
  - Bubble Pop
  - Checkers
  - Chess

## Planned Features

### Core Platform

- [ ] User authentication persistence
- [ ] Game progress saving
- [ ] Social features (friends, challenges)
- [ ] Achievement system
- [ ] Dark/light theme toggle

### Games

- [ ] Add Tetris
- [ ] Add Sudoku
- [ ] Add Tic‑tac‑toe
- [ ] Breakout — Ball color change after first brick hit (not on paddle) to allow pre‑planning next angle (documentation
  added; implementation scheduled)

- [ ] Point & Click — Rite of Discovery (working title)
  - Design & Narrative
    - [ ] Lock tone for ages 7–9; include “gentle mode” copy variants ✓ (see docs/rite-of-discovery-design.md)
    - [ ] Finalize scene beats and choices for S1/S2/S3 + Epilogue
    - [ ] Write i18n keys and English strings (en.json)
    - [ ] New Game+ — Mentor Mini (Sibling Helper): finalize beats, mentor‑tips copy; add 12+ reflection prompts
  - Scaffolding
    - [ ] Create package: games/rite-of-discovery with `RiteGame.tsx`, `state.ts`, `scenes/*`, `ui/*`
    - [ ] Add manifest entry (upcoming=false only at ship time)
    - [ ] Route `/games/rite-of-discovery` wired via dynamic import
  - Designer/Animator Brief (docs)
    - [x] Write English brief (designer deliverables, formats, sizes, naming, budgets) —
      docs/rite-of-discovery-designer-brief.md
    - [x] Add full French mirror (terminology aligned, specs identical)
    - [x] Add 15+ tracks section (MythWays & Origins) with asset templates and guardrails (EN+FR)
    - [x] Add New Game+ — Mentor Mini assets/checklist (EN+FR) with `epMM_*` and `ui_mentor_tips.svg`
    - [ ] Review with designer/animator and collect Q&A
    - [ ] Episode A asset pack delivery (BGs, props, badge/collectible) per checklist
    - [ ] Iteration pass after first integration video
  - Systems
    - [ ] Scene controller (registry + onEnter/next)
    - [ ] Hotspot component (ARIA, focus, keyboard, data-testid)
    - [ ] Dialogue modal (choices, gentle-mode toggle)
    - [ ] Save/Load service (localStorage v1 with versioning)
  - Content (MVP)
    - [ ] Scene 1 — tag reassembly micro-puzzle (3 pieces)
    - [ ] Scene 2 — note letter-match micro-puzzle (3 differences)
    - [ ] Scene 3 — proof moment (receipt/overhear) with choice branch
    - [ ] Epilogue — rite-of-passage framing; reflect prior choices
    - [ ] New Game+ — Mentor Mini dynamic echo (Tag/Note/Talk) based on S1–S3 flags; replay to see others
    - [ ] 12+ Reflection — optional MM1‑R journal prompts (framing/evidence/timing) after MM1
  - Art & Audio
    - [ ] 3–4 illustrated 16:9 scenes (WEBP/AVIF) + light parallax (reduced motion aware)
    - [ ] Ambient loop per scene; click/creak SFX using soundManager
    - [ ] Mentor Mini assets: `epMM_bg.avif`, `ui_mentor_tips.svg`, `ui_moment_cards_[1..3].svg`; reuse S1/S2 props
  - Accessibility
    - [ ] Visible focus on hotspots; keyboard traversal; aria-live for dialogue
    - [ ] Subtitles/captions for any voiced SFX (if added later)
    - [ ] Mentor Mini: ≥44px targets, readable tips, reduced‑motion stills, privacy‑respecting copy
  - Persistence & Telemetry
    - [ ] Persist on scene/choice; restore on reload
    - [ ] (Optional) Add analytics hooks (page/scene events) guarded by consent
    - [ ] Save keys: add `mentor.unlocked`, `mentor.seenRoutes`, `mentor.mentorStyle`; unit tests for defaulting
  - Testing
    - [ ] Playwright: flow through S1→S2→S3→Epilogue; assert text changes in gentle mode
    - [ ] RTL: reducer transitions; save/load; hotspot guards
    - [ ] Playwright: Mentor Mini unlock after Epilogue; route adapts to flags; replay shows alternates
    - [ ] RTL: mentor slice derivation (from S1–S3), tips overlay logic, persistence
  - Ship
    - [ ] Flip `enabled: true` in manifest; Featured follows Playable==Featured
    - [ ] Add card in catalog with image and tags
    - [ ] Update README with controls and notes
    - [ ] Docs cross‑links: design doc (Mentor Mini), stories tracker (MM1/MM1‑R), brief EN/FR

  - Post‑MVP (Episodes & Systems)
    - Systems foundation (v2)
      - [ ] Parental consent + Age/Tone selector (Gentle/Standard/Older) — persisted, settings toggle
      - [ ] Episode loader + 3 save slots, autosave on scene transitions (save v2 with v1 migration)
      - [ ] Collectibles + Journal/Codex (schema, UI, unlocks)
      - [ ] Difficulty scaling (Easy/Normal/Challenger): piece counts, hints, retries, reduced‑motion alternatives
      - [ ] Endings summary + replay map UI
    - Episode A — Winter Traditions
      - [ ] A1 Gift Closet Diversion (stealthy hotspot route)
      - [ ] A2 Neighborhood Lights Errand (neighbor NPC + collectible `ornament`)
      - [ ] A3 Fireplace Prep Redux (advanced tag puzzle)
    - Episode B — Tooth Tradition Variants
      - [ ] B1 Dentist Visit interlude (note variant)
      - [ ] B2 Lost Tooth Mystery (4–5 piece note assembly)
    - Episode C — Proof Alternatives
      - [ ] C1 Receipt Trail vs. Calendar App (exclusive routes per run)
      - [ ] C2 Overheard Phone Call vs. Costume Storage (exclusive routes)
    - Episode D — Side Stories
      - [ ] D1 Sibling Ally/Prankster path (badge unlock)
      - [ ] D2 Family Traditions Gallery (Codex entries)
    - Art pass (optional, non‑blocking)
      - [ ] Episode A asset pack (BGs, props, `collect_ornament.svg`, `badge_confidence.svg`)
      - [ ] Episode B asset pack (`collect_tooth_charm.svg`, `badge_curious.svg`)
      - [ ] Episode C asset pack (`collect_ribbon.svg`, `badge_detective.svg`)
      - [ ] Episode D/UI pack (journal frames, tabs, `badge_teamwork.svg`, `badge_helper.svg`)
    - Acceptance (first Post‑MVP release)
      - [ ] Episodes A & B playable with ≥1 major branch each; Age/Tone selector; save v2+slots; ≥3 collectibles;
        E2E/RTL green

  - Thinking Tools (12+ Extension — Rationality & Biases)
    - Curriculum & framing (story‑driven, fun, replayable; kindness/morality centered)
      - [ ] Define first 5 story cases with A/B routes + twist (Anchoring/Framing; Confirmation/Filter Bubble; Gambler’s
        Fallacy; Post Hoc/Placebo; Authority/Ad Hominem)
      - [ ] Debiasing strategies per case (steel‑man, base rates, alternative hypotheses, reframing, source
        triangulation, representative sampling)
    - Systems
      - [ ] 12+ confirmation / parental consent gate (where applicable)
      - [ ] Hint system + difficulty tiers (Easy/Normal/Expert)
      - [ ] “Thinking Tools” Codex section + mastery badges
    - Content (first pack)
      - [ ] Build 3 cases with ≥2 routes + 1 twist ending each (medals: Bronze/Silver/Gold)
      - [ ] Reflection cards (Codex entries) and mastery badges hooked up
    - Testing & A11y
      - [ ] Playwright: run through 2 branches per vignette; verify debias actions and Codex unlocks
      - [ ] RTL: reducer flags, hint logic, codex unlocks; ensure reduced‑motion alternatives are present
    - Acceptance
      - [ ] All 6 vignettes playable; hints/difficulty function; Codex + badges unlock; E2E/RTL green

  - 15+ Extension — Mythologies & Pantheons (MythWays)
    - Design & Curriculum (kindness‑centered, culturally sensitive)
      - [ ] Outline role archetypes, syncretic bridges, and environmental constraints
      - [ ] Define first pack: A1 River of Two Lands; A2 Meeting of Winds; A3 Paths of Exchange
    - Systems
      - [ ] Evidence sorter mini‑game (roles/epithets/contexts)
      - [ ] Route/path assembly on trade maps
      - [ ] Codex sections (Archetypes, Syncretic Bridges, Environmental Notes)
    - Content (first pack)
      - [ ] Build A1 with ≥2 routes + 1 twist; collectible + badge; Codex
      - [ ] Build A2 with ≥2 routes + 1 twist; collectible + badge; Codex
      - [ ] Build A3 (long case) with ≥2 routes + 1 twist; collectible + badge; Codex
    - Art & Audio (optional, non‑blocking)
      - [ ] Backgrounds (AVIF/WEBP) per case; inscriptions/props as SVG layers
      - [ ] Badges/collectibles; subtle ambient loops with reduced‑motion stills
    - Testing & A11y
      - [ ] Playwright: age‑gate → case select → A/B routes → twist → medals/Codex
      - [ ] RTL: sorter rules; save v3 migration; Codex unlock logic
    - Acceptance
      - [ ] Ship 2 shorts + 1 long; medals/Codex wired; E2E/RTL green; cultural sensitivity checklist signed off

  - 15+ Extension — Evolution & Nature (Origins)
    - Design & Curriculum (beauty of nature + evolutionary nuance)
      - [ ] Define first pack: O1 Island Shuffle; O2 Patterns in Pollen; O3 Tails/Songs/Signals
    - Systems
      - [ ] Trait sliders + fitness landscape mini‑games
      - [ ] Phylogeny builder; spot‑the‑adaptation flows
      - [ ] Codex sections (Mechanisms, Patterns, Case Albums)
    - Content (first pack)
      - [ ] Build O1 with ≥2 routes + 1 twist; collectible + badge; Codex
      - [ ] Build O2 with ≥2 routes + 1 twist; collectible + badge; Codex
      - [ ] Build O3 (long case) with ≥2 routes + 1 twist; collectible + badge; Codex
    - Art & Audio (optional, non‑blocking)
      - [ ] Backgrounds (field/lab) per case; charts/overlays as SVG
      - [ ] Badges/collectibles; subtle ambient loops with reduced‑motion stills
    - Testing & A11y
      - [ ] Playwright: age‑gate → case select → A/B routes → twist → medals/Codex
      - [ ] RTL: slider math; save v3 migration; Codex unlock logic
    - Acceptance
      - [ ] Ship 2 shorts + 1 long; medals/Codex wired; E2E/RTL green; a11y basics verified

Shipped (already available via manifest and listed under Completed):

- Breakout, Memory, Snake, Knitzy, Bubble Pop, Checkers, Chess

### Technical Improvements

- [x] Implement runtime game loading with dynamic imports (via central games manifest) — Phase 1: manifest + `[slug]`
  route + catalog wired
- [ ] Implement admin‑controlled flags to drive manifest enable/upcoming state and UI gates (Phase 2)
- [ ] Add service worker for offline capabilities
- [ ] Implement WebSocket for real-time multiplayer games
- [ ] Add performance monitoring
- [ ] Set up error tracking

### Deployment & Operations

- [ ] Set up monitoring and alerting
- [ ] Implement feature flags for gradual rollouts
- [ ] Set up A/B testing framework
- [ ] Implement automated backup strategy

### Monetization & Ads

- [ ] Advertisement band (right side) visible only for non‑subscribed users — design and gating rules; avoid impacting
  gameplay viewports (planned)

## Notes

- Backend API is expected to be running on port 8080 locally
- Frontend runs on port 3000 by default
- Environment configuration is managed through `.env.local`
- Follows semantic versioning for releases

## Recent Updates

- 2025-12-19: Published execution plan for Launcher Phase 2, Admin (frontend‑only), particles reliability, Snake
  controllers, Memory UX, assets/backgrounds, docs, and E2E expansions
- 2025-12-19: Implemented manifest‑driven launcher Phase 1 (manifest + `[slug]` route + catalog wired)
- 2025-12-19: Prioritized new playable MVPs (in order): Knitzy, Bubble Pop, Checkers, Chess. Added detailed tasks to In
  Progress.
- 2025-12-20: Finalized all 7 MVP games as playable and featured in catalog; added E2E smokes for each game and updated
  docs
- 2025-12-21: Added design doc outline for “Rite of Discovery” point-and-click MVP (docs/rite-of-discovery-design.md)
  and
  planned tasks under
  Planned Features → Games; scope includes gentle mode, i18n-ready strings, local save, and E2E coverage.
- 2025-12-21: Post‑MVP roadmap approved for Rite of Discovery (episodes A–D, systems v2, collectibles/journal) and
  designer asset specs appended. Added 12+ “Thinking Tools” extension plan (rationality & biases) with replayable
  vignettes and mastery.
- 2025-12-21: Added bilingual Designer/Animator Brief (EN/FR) with niceness/morality guardrails, fun & replayable 12+
  case
  structures, and full asset specs/checklists. Linked from docs/rite-of-discovery-design.md.
- 2025-12-20: Theming overhaul — galaxy dark + star‑glow light via CSS variables in `app/globals.css`; palette tokens
  defined in requested order and mapped to shadcn semantic tokens for both themes; `--app-bg` drives backgrounds with
  documented light alternatives (cool/minimal). Playwright smoke asserts `body` background-image contains `gradient` in
  both themes. Game cards are fully clickable with preserved accessibility.
- 2025-12-20: Fixed background visibility regression (`:root`), added broad browser FALLBACKs (no oklch/color-mix) so
  backgrounds render everywhere; smoke test validates gradients in both themes. Added plan items: Breakout ball‑color
  change (doc now), advertisement band for non‑subscribers.
- 2025-12-20: Follow-up fix — corrected `:root` selector (typo recovery), re‑asserted
  `body{background-image:var(--app-bg)}`; added explicit verification task under In Progress and awaiting confirmation.
- 2025-12-20: Seamless layout pass — removed heavy borders on home sections, made header/footer translucent, exposed
  galaxy/star‑glow backgrounds; unified card sizing (flex, line‑clamp) for consistent grids.
- 2025-12-20: Featured alignment completed — manifest as single source (Playable == Featured). Home now displays
  Featured Games and Featured Projects only (no Upcoming). Games page badges: Featured (green), Upcoming (yellow).
  Knitzy MVP renamed to Pattern Matching; upcoming Knitzy added; redirect added; E2E updated.
- 2025-12-18: Initial action plan created
- 2025-12-18: Added Breakout and Memory games
- 2025-12-18: Added Quest Hunt to Coming Soon projects
- 2025-12-18: Planned Admin Dashboard (frontend-only) with feature flags and audit; outlined manifest-driven game
  launcher
- 2025-12-17: Set up CI/CD pipeline
- 2025-12-16: Implemented authentication system
