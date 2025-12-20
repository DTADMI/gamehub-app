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

## In Progress

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
- 2025-12-20: Theming overhaul — galaxy dark theme and star‑glow light theme via CSS variables in `app/globals.css`;
  game cards are now fully clickable (entire card links to the game) with preserved Play CTA and accessibility.
- 2025-12-18: Initial action plan created
- 2025-12-18: Added Breakout and Memory games
- 2025-12-18: Added Quest Hunt to Coming Soon projects
- 2025-12-18: Planned Admin Dashboard (frontend-only) with feature flags and audit; outlined manifest-driven game
  launcher
- 2025-12-17: Set up CI/CD pipeline
- 2025-12-16: Implemented authentication system
