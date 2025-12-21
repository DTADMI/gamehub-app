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
- 2025-12-18: Initial action plan created
- 2025-12-18: Added Breakout and Memory games
- 2025-12-18: Added Quest Hunt to Coming Soon projects
- 2025-12-18: Planned Admin Dashboard (frontend-only) with feature flags and audit; outlined manifest-driven game
  launcher
- 2025-12-17: Set up CI/CD pipeline
- 2025-12-16: Implemented authentication system
