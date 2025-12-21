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
    - [ ] Lock tone for ages 7–9; include “gentle mode” copy variants ✓ (see docs/rite-of-discovery.md)
    - [ ] Finalize scene beats and choices for S1/S2/S3 + Epilogue
    - [ ] Write i18n keys and English strings (en.json)
  - Scaffolding
    - [ ] Create package: games/rite-of-discovery with `RiteGame.tsx`, `state.ts`, `scenes/*`, `ui/*`
    - [ ] Add manifest entry (upcoming=false only at ship time)
    - [ ] Route `/games/rite-of-discovery` wired via dynamic import
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
  - Art & Audio
    - [ ] 3–4 illustrated 16:9 scenes (WEBP/AVIF) + light parallax (reduced motion aware)
    - [ ] Ambient loop per scene; click/creak SFX using soundManager
  - Accessibility
    - [ ] Visible focus on hotspots; keyboard traversal; aria-live for dialogue
    - [ ] Subtitles/captions for any voiced SFX (if added later)
  - Persistence & Telemetry
    - [ ] Persist on scene/choice; restore on reload
    - [ ] (Optional) Add analytics hooks (page/scene events) guarded by consent
  - Testing
    - [ ] Playwright: flow through S1→S2→S3→Epilogue; assert text changes in gentle mode
    - [ ] RTL: reducer transitions; save/load; hotspot guards
  - Ship
    - [ ] Flip `enabled: true` in manifest; Featured follows Playable==Featured
    - [ ] Add card in catalog with image and tags
    - [ ] Update README with controls and notes

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
    - Curriculum & framing
      - [ ] Define first 6 vignettes (confirmation bias; base‑rate neglect; post hoc fallacy; framing/loss aversion;
        authority/social proof; availability)
      - [ ] Debiasing strategies per vignette (steel‑man, base rates, alternative hypotheses, reframing, source
        triangulation, representative sampling)
    - Systems
      - [ ] 12+ confirmation / parental consent gate (where applicable)
      - [ ] Hint system + difficulty tiers (Easy/Normal/Expert)
      - [ ] “Thinking Tools” Codex section + mastery badges
    - Content (first pack)
      - [ ] Build 6 vignettes with ≥2 branches and one debias action each
      - [ ] Reflection cards (Codex entries) and mastery badges hooked up
    - Testing & A11y
      - [ ] Playwright: run through 2 branches per vignette; verify debias actions and Codex unlocks
      - [ ] RTL: reducer flags, hint logic, codex unlocks; ensure reduced‑motion alternatives are present
    - Acceptance
      - [ ] All 6 vignettes playable; hints/difficulty function; Codex + badges unlock; E2E/RTL green

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
- 2025-12-21: Added design doc outline for “Rite of Discovery” point-and-click MVP (docs/rite-of-discovery.md) and
  planned tasks under
  Planned Features → Games; scope includes gentle mode, i18n-ready strings, local save, and E2E coverage.
- 2025-12-21: Post‑MVP roadmap approved for Rite of Discovery (episodes A–D, systems v2, collectibles/journal) and
  designer asset specs appended. Added 12+ “Thinking Tools” extension plan (rationality & biases) with replayable
  vignettes and mastery.
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
