# Project Guidelines — GameHub (Authoritative)

This repository’s up‑to‑date, end‑to‑end guide now lives in the main README.

Please refer to `README.md` for:

- prerequisites and environment setup
- environment variables for local/dev/prod
- local development (backend on 8080, frontend on 3000)
- testing (unit/integration/e2e)
- manual deploy to Cloud Run (frontend service `gamehub-app`, backend service `gamehub-api`)
- CI/CD via GitHub Actions (Artifact Registry repo `gamehub`)
- troubleshooting and technology choices

If you change ports, envs, or deployment steps, update `README.md` accordingly.

Notes specific to Junie (keep in sync with README):

- Key ports: backend 8080, frontend 3000. `NEXT_PUBLIC_API_URL` must end with `/api` (e.g.,
  `http://localhost:8080/api`).
- E2E tests: Playwright starts the dev server with `NEXT_PUBLIC_DISABLE_PROVIDERS=true` to avoid initializing
  Auth/GraphQL providers that can crash in CI. Do not set this for production builds.
- Prerendering: `/account/subscribe/success` is intentionally dynamic (`export const dynamic = "force-dynamic"`) because
  it reads subscription/session at runtime; do not convert to SSG.

CI/CD quick facts (updated):

- Workflows:
    - `.github/workflows/ci-cd.yml` — runs on push to `main` (and manual dispatch) only. It tests, builds the frontend
      image once, pushes to GCP Artifact Registry (primary) and Docker Hub (optional mirror), and deploys to Cloud Run
      with `--port=3000`.
    - `.github/workflows/test-e2e.yml` — runs Playwright E2E on Pull Requests (and manual dispatch). Uses mobile
      emulation projects too.
    - `.github/workflows/ci-pr.yml` — runs on Pull Requests for fast checks: lint + unit (Vitest) + type-check (tsc) +
      build; no deploy, no E2E. Caches pnpm to speed up.
- Required repo vars/secrets:
    - Vars: `AR_REPO=gamehub`, `FRONTEND_SERVICE=gamehub-app`, `BACKEND_SERVICE=gamehub-api`, `DOCKERHUB_USERNAME`.
    - Secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`,
      `DOCKERHUB_TOKEN`, `NEXT_PUBLIC_API_URL` (prod).
- Auth options (choose one):
    - Service Account key (not recommended): `GCP_SA_KEY` JSON.
    - Workload Identity Federation (recommended): `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.
- Cloud Run port expectations: frontend `--port=3000`; backend (separate repo/service) `--port=8080`.

Local backend fallback (optional helper):

- Use `pnpm backend:up` to ensure a backend is reachable at `http://localhost:8080`:
    - It checks `/api/health` then `/actuator/health`.
    - If not running, it tries to pull the latest backend image from GCP Artifact Registry first:
      `${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${AR_REPO}/${BACKEND_SERVICE}:latest`
      and falls back to Docker Hub: `docker.io/${DOCKERHUB_USERNAME}/${BACKEND_SERVICE}:latest`.
    - Then it runs the container on port 8080 (`--name gamehub-backend-latest`).
- Stop it with `pnpm backend:down`.
- Notes: If your backend requires DB env vars, the container may fail to become healthy — in that case, run your local
  backend from source or provide a compose file with DB.

## Design Doc: Rite of Discovery - Point-and-Click MVP

Note: This design has been moved to a dedicated document under `docs/`. The canonical, up-to-date version now lives at:

- docs/rite-of-discovery.md

The content below is kept temporarily for historical context and will be pruned; please edit the file in `docs/` going
forward.

### Overview

Short, gentle adventure for ages 7-9 about discovering that traditions like Santa and the Tooth Fairy are family-made
magic. Ending frames it as a rite of passage.

### MVP Goals

- 8-12 minutes, 3 scenes + epilogue
- Clickable hotspots, simple puzzles, light dialogue
- Gentle mode toggle (softer wording)
- Local save; i18n-ready strings (English only)
- Extensible scenes/chapters

### Narrative Outline (MVP)

- Scene 1 — Night Before (Living Room)
  - Goal: introduce curiosity; teach interaction
  - Hotspots: wrapping paper roll, tape dispenser, gift tag, cookie plate, fireplace
  - Micro-puzzle: reassemble torn tag (drag 3 pieces); success reveals handwriting matching a parent’s note
  - Choice: keep suspicion private vs. ask leading question; sets flag `s1.askParent`
  - Gentle copy: “maybe helpers?” vs. explicit “parents write tags”
- Scene 2 — Tooth Tradition (Kid’s Bedroom)
  - Goal: pattern recognition via keepsake box/note
  - Hotspots: pillow, nightstand drawer, keepsake box, squeaky floorboard (SFX), window
  - Micro-puzzle: compare letters on two notes (spot-the-difference, click 3 matches)
  - Choice: take the note vs. leave it; sets `s2.keepNote`
- Scene 3 — Store or Attic (Proof Moment)
  - Goal: gently confirm family tradition; overheard planning or find a receipt
  - Hotspots: storage bin, receipt, phone on speaker (muffled), closet/attic door
  - Dialogue: overhear “pick up the costume”/“hide the gift”; gentle mode avoids direct terms
  - Choice: confront now vs. save it for later; sets `s3.confrontNow`
- Epilogue — Rite of Discovery
  - Parents invite conversation; frame it as a rite of passage where kids eventually outsmart the grown-ups
  - Player choices reflect in tone: proud/celebratory vs. cozy/affirming
  - Unlock a small ‘Helper Badge’ and optional credits page

### Gameplay & UX

- Hotspots with clear focus/hover, keyboard accessible
- 2-3 dialogue options; no fail states
- Tiny inventory (0-3 items)
- Save in localStorage; restore on reload
- Accessibility: captions, readable text, visible focus, reduced motion support

### Stack & Architecture

- Next.js 16, React 19 (client page under `/games/rite-of-discovery`)
- Rendering: DOM + CSS hotspots (no heavy engine); 16:9 illustrated scenes as background images in a responsive
  container
- Scene system: lightweight controller with a registry `{ id: SceneId, component, onEnter, next(sceneState) }`
- State: React Context + reducer (`scene`, `flags`, `inventory`, `choices`, `gentle`), seam for XState later
- i18n: i18next (client) or tiny `t()` util with structured message keys; English bundle `en.json`
- Audio: reuse `soundManager` (ambient loop per scene + click/creak SFX)
- Persistence: localStorage via `save(versionedState)`/`loadOrInit()`; storage key `rod:save:v1`
- Testing: Playwright E2E (scene progression, gentle toggle), RTL for reducers and hotspot logic

### Technical Choices & Alternatives (pros/cons)

- Rendering
  - DOM+CSS (chosen):
    - Pros: smallest runtime, a11y semantics, easy hotspots, SEO-friendly structure
    - Cons: complex animations are harder; parallax/perf must be tuned
  - Pixi (alt):
    - Pros: fast sprites, filters
    - Cons: a11y harder; extra bundle; overkill for static scenes
  - Phaser (alt):
    - Pros: full scene/input/audio system
    - Cons: heavy; game-loop centric; a11y/SSR friction
- State management
  - Context+Reducer (chosen): simple, serializable saves
  - XState (alt):
    - Pros: explicit states/guards; great for branching
    - Cons: more boilerplate; learning curve for contributors
- i18n
  - Minimal `t()` util (chosen MVP) with en.json
  - i18next (alt): full features, pluralization; slightly larger
- Persistence
  - localStorage (chosen): offline, instant
  - Backend profile (alt):
    - Pros: cross-device continuity, analytics
    - Cons: requires auth, backend endpoints, consent
- Art pipeline
  - Static images + CSS parallax (chosen): predictable, light
  - Lottie/SVG animations (alt): smooth micro-animations; adds tooling

### Data Model (save v1)

```
version: 1
gentle: boolean
scene: s1 | s2 | s3 | epilogue
flags: key-> boolean/number/string
choices: [{ scene, key, value }]
```

### Implementation Plan (engineered)

1) Scaffolding: games/rite-of-discovery/, RiteGame.tsx, scenes/, strings.ts; add to manifest as upcoming
2) Systems: scene controller, hotspot component (data-testid, ARIA), dialogue modal, save/load
3) Content: S1/S2/S3 with 3-6 hotspots each + 1 micro-puzzle in S1/S2; gentle-mode copy variants
4) Audio/Polish: ambient per scene; click/creak SFX; subtle parallax (reduced-motion aware)
5) Persistence & QA: save on scene change/choice; Playwright flows to epilogue; selectors stable
6) Ship: flip enabled true in manifest; Featured follows Playable==Featured

### File layout (proposal)

```
games/rite-of-discovery/
  src/
    index.ts
    RiteGame.tsx
    state.ts (types, reducer, save/load)
    scenes/
      Scene1.tsx
      Scene2.tsx
      Scene3.tsx
      Epilogue.tsx
    ui/
      Hotspot.tsx
      Dialog.tsx
    i18n/en.json
    assets/ (images)
```

### Hotspot schema (authoring)

```
type Hotspot = {
  id: string;
  aria: string;         // accessible label
  rect: [x, y, w, h];   // percentage in 16:9 container (0..100)
  onClick: (ctx) => void | NextScene;
  requires?: string[];  // flags needed
  sets?: Record<string, any>;
}
```

### Testing Strategy

- E2E (Playwright)
  - Load /games/rite-of-discovery
  - Toggle gentle mode → text variants visible
  - Click through S1 puzzle, S2 note compare (stub simplified), S3 proof, Epilogue path A/B
- RTL
  - Reducer transitions; save/load
  - Hotspot guards/side-effects

### Performance & Accessibility

- 16:9 images optimized (WEBP/AVIF) with Next Image or plain img (static public assets)
- Reduced motion: disable parallax and animations when `prefers-reduced-motion`
- Focus rings and keyboard nav between hotspots; `aria-live` for dialogue

### Extensibility

- Scenes are additive; epilogue can branch on more flags later
- Save versioning guard for migrations
- Backend sync toggled by auth flag in future

### Acceptance Criteria

- End-to-end in <= 12 minutes; gentle mode changes >= 5 lines
- Hotspots keyboard accessible; focus visible; screen-reader labels
- Choices persist and epilogue reflects path
- E2E smokes pass (scenes + epilogue)
