# GameHub Architecture & Monorepo Transition

## Overview

GameHub is a portfolio platform designed for discovering and playing games, browsing projects, and social interaction.
This document outlines the current architecture and the proposed transition to a robust, scalable monorepo.

### Objectives

- **Mobile First**: Responsive design for all games and platform features.
- **Secure**: Protected user data, secure API interactions.
- **User-Friendly & Engaging**: Fun, interactive, and high-performance experience.
- **Accessible**: Compliance with WCAG standards (e.g., `<DialogueBox>` for a11y).
- **Feature-Flagging**: Incremental development and safe feature rollouts.
- **Cost-Effective**: Optimizing for low-cost or free-tier hosting where possible.

---

## Current Architecture

The application is currently a **standalone Next.js frontend** that is backend-agnostic.

- **Frontend**: Next.js 16 (React 19), Tailwind CSS.
- **Games**: Custom React-based games and specialized engines (e.g., `pointclick`).
- **Shared Logic**: `libs/shared` for common types and engine code.
- **Development Backend**: Dockerized Spring Boot image for local API simulation.
- **State Management**: `localStorage` and React Context.

---

## Targeted Monorepo Architecture

A formalized monorepo using **pnpm workspaces** and **Turborepo**.

### Structure

```
/gamehub-monorepo
  /apps
    /web                # Next.js frontend
    /api                # Node.js TypeScript backend
    /docs               # Documentation site (optional)
  /packages
    /shared             # Shared types, Zod schemas, validation logic
    /engine             # Core game engines (Point & Click, Physics, etc.)
    /ui                 # Shared React components (Radix UI based)
    /config             # Shared ESLint, Prettier, and TS configs
  /games
    /catalog            # Metadata and manifest of all games
    /{game-id}          # Individual game packages
```

---

## Full Stack Recommendations

### 1. Frontend

- **Recommendation**: **Next.js (App Router)**
    - **Pros**: SSR for SEO, built-in routing, excellent performance.
    - **Cons**: Can be complex for pure SPAs.
    - **Alternative**: Vite (for pure CSR games/apps).
- **Styling**: **Tailwind CSS** (Current)
    - **Pros**: Rapid UI development, small bundle size.
    - **Cons**: Learning curve for utility classes.
- **Component Library**: **Radix UI** + **Shadcn/UI**
    - **Pros**: Highly accessible, customizable.

### 2. Backend

- **Recommendation**: **Fastify** or **NestJS** (Node.js + TypeScript)
    - **Pros**: Fastify is extremely high-performance; NestJS provides excellent structure.
    - **Cons**: NestJS has a steeper learning curve.
    - **Alternative**: Next.js API Routes (Serverless).
- **API Style**: **REST with Zod** or **tRPC**.
    - **Pros**: tRPC provides end-to-end type safety without code gen.

### 3. Database

- **Recommendation**: **PostgreSQL** with **Prisma** or **Drizzle ORM**.
    - **Pros**: Relational data (user profiles, game stats) is well-handled; Drizzle is lightweight and type-safe.
    - **Cons**: Requires management (though managed services exist).
    - **Alternative**: MongoDB (if data is highly unstructured).
- **Caching**: **Redis** (for leaderboards and session caching).

### 4. Game Development (2D/3D)

- **2D Recommendation**: **Phaser 3** or **Custom Canvas/SVG Engine** (for light puzzles).
    - **Pros**: Phaser is the industry standard for web 2D games.
- **3D Recommendation**: **Three.js** with **React Three Fiber (R3F)**.
    - **Pros**: Declarative 3D, great ecosystem.
    - **Cons**: Performance overhead on low-end mobile.
    - **Alternative**: Babylon.js.

### 5. Feature-Flagging

- **Recommendation**: **PostHog** or **GrowthBook**.
    - **Pros**: Open-source options, includes analytics.
    - **Cons**: Third-party dependency.
    - **Alternative**: Custom `feature-flags.json` fetched via Edge Config (Vercel).

### 6. Deployment & Hosting

- **Frontend**: **Vercel** (Free tier for hobby projects).
- **Backend**: **Railway** or **Render** (Easy Node.js hosting).
- **Database**: **Supabase** (Managed Postgres with a generous free tier).
- **Assets (CDN)**: **Vercel Blob** or **AWS S3 + CloudFront**.

### 7. Testing

- **Unit**: **Vitest** (Fast, Jest-compatible).
- **E2E**: **Playwright** (Excellent mobile emulation).

---

## Games Catalog

### Current Games

- **Snake**: Arcade classic, mobile-first swipe controls.
- **Memory**: Card matching with polished animations.
- **Breakout**: Physics-based block breaker.
- **Rite of Discovery (ROD)**: Narrative exploration.
- **Toymaker Escape (TME)**: Point & click puzzle.
- **Systems Discovery (SD)**: Educational systems simulation.
- **Knitzy**: Dice-based strategy game.
- **Platformer / Tower-defense**: Classic arcade and strategy genres.
- **Tetris / Chess / Checkers / Bubble Pop**: Classic logic games.

### Planned Games (from New Games Development Plan)

- **ChronoShift Labyrinth**: Time-manipulation maze sections.
- **Elemental Conflux**: Multi-character elemental puzzle solving.
- **Quantum Architect**: Quantum state manipulation for construction.

---

## Monorepo Migration Plan (Backlog)

1. Initialize `pnpm-workspace.yaml`.
2. Migrate `libs/shared` to `packages/shared`.
3. Migrate `games/` to `packages/games` or a dedicated workspace.
4. Scaffold `apps/api` with Fastify/TypeScript.
5. Configure Turborepo for orchestration.
6. Setup Prisma/Drizzle with PostgreSQL.
