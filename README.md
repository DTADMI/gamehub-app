# GameHub — Next.js Frontend

GameHub is a Next.js 16 frontend where you can play my web games and browse my other projects. This repository is the
frontend only (not a monorepo). It is backend‑agnostic and talks to a separate API via a single environment variable.

This guide helps a newcomer run the frontend locally, test it, and deploy it to Google Cloud Run both manually and via
GitHub Actions. It also documents the technological choices and trade‑offs made for this project.

Important defaults used here:

- Backend listens on port 3000 locally.
- Frontend listens on port 8080 locally.

— — —

Table of contents

1. Prerequisites
2. Environment variables (local and CI/CD)
3. Local development
4. Testing (Playwright e2e)
5. Build & production run
6. Deploy to Google Cloud Run (manual)
7. Deploy to Google Cloud Run (GitHub Actions)
8. Design choices: why Next 16 + Tailwind v4 + shadcn
9. Troubleshooting

— — —

1) Prerequisites

- Node.js 20+
- pnpm (recommended; Corepack can enable it automatically) or npm
- Docker and `gcloud` CLI (for Cloud Run)
- A Google Cloud project with Artifact Registry and Cloud Run enabled

2) Environment variables

Create a `.env.local` (for local dev) with at least:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GITHUB_URL=https://github.com/DTADMI
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/darryl-ulrich-t-62358476/
NEXT_PUBLIC_CONTACT_EMAIL=dtadmi@gmail.com
```

Notes:

- `NEXT_PUBLIC_API_URL` must point to your backend base URL and include the `/api` suffix.
- Additional optional envs are documented in `.env.example`.

3) Local development

Install and run the frontend on port 8080:

```
pnpm i
pnpm dev
# → http://localhost:8080
```

Point it to a running backend (port 3000 preferred):

```
export NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4) Testing (Playwright e2e)

We include Playwright in devDependencies and a smoke test suite that:

- Opens each `/games/<slug>` route.
- Asserts a container with `role="application"` renders.
- Verifies pressing Space doesn’t scroll the page (thanks to the shared key‑capture helper).

Run e2e tests:

```
pnpm exec playwright install --with-deps
pnpm test:e2e
```

5) Build & production run

```
pnpm build
pnpm start  # starts on port 8080
```

### Game controls (quick reference)

- Snake: Arrows to move; Space to pause/resume; Space after Game Over to restart.
- Breakout: Move with mouse or arrows; Space to pause/resume.
- Tetris: Arrows to move; Up to rotate; Space may drop/pause depending on variant.
- Block‑Blast: Click a rack piece, then click a cell to place; clear rows/cols for points.
- Memory: Click cards to match pairs.
- Checkers/Chess: Click a piece, then the target square; follow legal moves.
- Platformer: WASD/Arrows to move; Space to jump.
- Tower‑Defense: Click to place towers; defend the path.
- Knitzy: Mouse interactions per puzzle; follow on‑screen hints.

All games use a focusable application region and shared key capture so Space/Arrows never scroll the page.

### Feature flags (Explore examples)

These can be set in `.env.local` (or Cloud Run service env):

```
NEXT_PUBLIC_FEATURE_EXPLORE_CAROUSELS=true
NEXT_PUBLIC_FEATURE_EXPLORE_SHOW_FEATURED=true
NEXT_PUBLIC_FEATURE_EXPLORE_SHOW_UPCOMING=true
NEXT_PUBLIC_FEATURE_EXPLORE_SHOW_PROJECTS_FEATURED=true
NEXT_PUBLIC_FEATURE_EXPLORE_SHOW_PROJECTS_COMING_SOON=true
```

Set a flag to `false` to hide that section or disable carousels (grids will be used instead).

6) Deploy to Google Cloud Run (manual)

Build and push the container to Artifact Registry, then deploy:

```
PROJECT=<your-project-id>
REGION=<your-region>            # e.g. northamerica-northeast1
REPO=<your-artifact-repo>       # e.g. gamehub
IMAGE=$REGION-docker.pkg.dev/$PROJECT/$REPO/gamehub:$(git rev-parse --short HEAD)

# Build
docker build -t $IMAGE .

# Push
gcloud auth configure-docker $REGION-docker.pkg.dev
docker push $IMAGE

# Deploy to Cloud Run (public)
gcloud run deploy gamehub \
  --image=$IMAGE \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars=NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api
```

7) Deploy to Google Cloud Run (GitHub Actions)

This repo includes `.github/workflows/deploy-cloud-run.yml` which:

- Builds the app and the Docker image.
- Pushes to Artifact Registry.
- Deploys to Cloud Run.

Required GitHub repository secrets:

- `GCP_PROJECT_ID` — your project ID
- `GCP_REGION` — deployment region (e.g., `northamerica-northeast1`)
- `GCP_ARTIFACT_REPO` — Artifact Registry repo name (e.g., `gamehub`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER` — OIDC provider resource name
- `GCP_SERVICE_ACCOUNT` — service account email with `Artifact Registry Writer` and `Cloud Run Admin`
- `NEXT_PUBLIC_API_URL` — backend API base with `/api` suffix for the deployed service

8) Design choices and trade‑offs

- Next.js 16 + React 19: modern app router with good DX; dynamic imports for game bundles keep initial payloads small.
- TailwindCSS v4 + shadcn‑style tokens: rapid UI development with a custom palette; consistent semantic colors.
- Feature flags: simple hook reads `NEXT_PUBLIC_FEATURE_*` and can optionally query a backend `/api/features` endpoint.
- Input handling: a shared helper prevents Space/Arrows from scrolling while a game is focused, improving usability.
- Games are isolated packages under `games/` and imported via aliases; SSR is disabled per game page to avoid hydration
  pitfalls for canvas‑heavy UIs.

Alternatives considered:

- A full game engine (Phaser, Pixi) — heavier runtime and different render model; current mini‑games are simple enough
  with Canvas/DOM/Three.
- Monorepo (Nx/Turborepo) — not needed for a single frontend; kept aliases simple in `tsconfig.json` and
  `next.config.ts`.
- Server‑side sessions — kept frontend backend‑agnostic and compatible with JWT; NextAuth is configured for credential
  login when the backend exposes endpoints.

9) Troubleshooting

- Hydration warnings
    - Ensure any client‑only UI (theme toggles etc.) uses deterministic SSR markup. We fixed Footer imports and heading
      classes to remove drift.
- Space bar scrolls the page while playing
    - Each game page uses a focusable container + shared input capture. If you add a new game, copy that wrapper.
- 404 importing `@games/*`
    - Check `tsconfig.json` `paths` and `next.config.ts` webpack aliases. Games live under `games/<id>/src`.
- Cloud Run shows a 404 on nested routes
    - Ensure the container serves on `PORT=8080` and that you haven’t configured a basePath/assetPrefix incorrectly.
      This repo serves with `next start -p 8080`.

Deploy to Cloud Run:

```
gcloud run deploy ${BACKEND_SERVICE} \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/${AR_REPO}/${BACKEND_SERVICE}:${SHA} \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod \
  --add-cloudsql-instances "${PROJECT}:${REGION}:games-postgresql-instance" \
  --set-secrets "\
SPRING_DATASOURCE_URL=SPRING_DATASOURCE_URL:latest,\
SPRING_DATASOURCE_USERNAME=SPRING_DATASOURCE_USERNAME:latest,\
SPRING_DATASOURCE_PASSWORD=SPRING_DATASOURCE_PASSWORD:latest,\
NEXT_FIREBASE_CREDS_TYPE=NEXT_FIREBASE_CREDS_TYPE:latest,\
NEXT_FIREBASE_CREDS_PROJECT_ID=NEXT_FIREBASE_CREDS_PROJECT_ID:latest,\
NEXT_FIREBASE_CREDS_PRIVATE_KEY_ID=NEXT_FIREBASE_CREDS_PRIVATE_KEY_ID:latest,\
NEXT_FIREBASE_CREDS_PRIVATE_KEY=NEXT_FIREBASE_CREDS_PRIVATE_KEY:latest,\
NEXT_FIREBASE_CREDS_CLIENT_EMAIL=NEXT_FIREBASE_CREDS_CLIENT_EMAIL:latest,\
NEXT_FIREBASE_CREDS_CLIENT_ID=NEXT_FIREBASE_CREDS_CLIENT_ID:latest,\
NEXT_FIREBASE_CREDS_AUTH_URI=NEXT_FIREBASE_CREDS_AUTH_URI:latest,\
NEXT_FIREBASE_CREDS_TOKEN_URI=NEXT_FIREBASE_CREDS_TOKEN_URI:latest,\
NEXT_FIREBASE_CREDS_AUTH_PROVIDER_X509_CERT_URL=NEXT_FIREBASE_CREDS_AUTH_PROVIDER_X509_CERT_URL:latest,\
NEXT_FIREBASE_CREDS_CLIENT_X509_CERT_URL=NEXT_FIREBASE_CREDS_CLIENT_X509_CERT_URL:latest,\
NEXT_FIREBASE_CREDS_UNIVERSE_DOMAIN=NEXT_FIREBASE_CREDS_UNIVERSE_DOMAIN:latest"

# Frontend (SSR)
# Next.js listens on PORT provided by Cloud Run; we deploy the service listening on 8080.
gcloud run deploy games-frontend \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://<backend-domain>/api
```

Optional: put Cloud CDN in front of the frontend service via HTTPS Load Balancer to cache static assets.

### Frontend builds in a monorepo (workspace dependencies)

The frontend depends on local workspace packages (e.g., `@games/shared`, `@games/breakout`, etc.) located under `libs/`
and `games/`.

- If you use the small frontend-only build context (`-f frontend/Dockerfile ./frontend`), those workspaces are outside
  the context and cannot be resolved by Bun, resulting in errors like "Workspace dependency not found."
- For CI/CD and production, use the monorepo-aware Dockerfile which copies only the necessary folders and installs at
  the repository root so workspaces resolve correctly:

Build from repo root with Dockerfile.monorepo:

```bash
REGION=<your-region>
PROJECT=<your-project>
SHA=$(git rev-parse --short HEAD)

docker build \
  -t ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  -f frontend/Dockerfile.monorepo \
  .

docker push ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA}

gcloud run deploy games-frontend \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://<backend-domain>/api
```

Notes:

- For fully reproducible installs, generate and commit `frontend/bun.lockb` (run `bun --cwd frontend install` once, then
  commit the lockfile).
- The existing `frontend/Dockerfile` remains useful for local iteration when you copy or publish dependencies into the
  frontend, but for the current monorepo layout prefer `frontend/Dockerfile.monorepo`.

#### Troubleshooting: Cloud Run container didn’t listen on the expected port (frontend 8080)

Next.js `next start` listens on port 3000 by default. Cloud Run health checks expect your container to listen on the
port provided in the `PORT` environment variable (we deploy the frontend on 8080). You can fix this in one of two ways:

- Easiest: deploy the frontend with `--port=8080` (as shown above) so Cloud Run targets 8080 for health checks and
  traffic.
- Alternatively: change the frontend start script to bind to the `PORT` env automatically so no `--port` flag is needed:

  ```json
  {
    "scripts": {
      "start": "next start -p ${PORT:-8080}"
    }
  }
  ```

With the script change, Cloud Run will set `PORT` and the app will listen on it (8080 in our deployment).

---

## Strategy: ship new games without rebuilding the whole app

Today the Next.js app statically imports game packages from the monorepo. That means a new game (or version) normally
requires rebuilding the frontend image so the new code is included in the bundle. If the goal is to publish or update a
game independently, there are a few approaches (in increasing decoupling order):

1. Versioned packages in a registry (build-time coupling)

- Publish each game as `@games/<name>` to a private registry (Artifact Registry npm or GitHub Packages).
- The frontend depends on semver ranges. Updating a game means bumping the version and rebuilding the frontend to pull
  it.
- Pros: simple DX; keeps code sharing via packages. Cons: still requires a frontend rebuild to pick up a new version.

2. Runtime-loaded remote modules (strong decoupling; no frontend rebuild)

- Bundle each game as a standalone ESM artifact (e.g., upload to Cloud Storage/Cloud CDN) and load via `import()` at
  runtime from a versioned URL. Serve a small manifest (JSON) mapping game slugs to versioned URLs; the frontend reads
  it and dynamic-imports.
- Pros: deploy a new game by uploading artifacts and updating the manifest; no frontend image rebuild required (as
  long as contracts stay compatible). Cons: slightly more complex infra; need cache-busting and integrity controls.

3. Micro-frontends per game (highest isolation)

- Host each game as its own service (Cloud Run) and embed via iframe or Module Federation. Pros: independent
  deployments and scaling. Cons: more moving parts and potential UX/network overhead.

Recommended path for this repo:

- Stage A (now, implemented): use a monorepo-aware build (`frontend/Dockerfile.monorepo`) so the CI/CD pipeline reliably
  builds the current architecture.
- Stage B (optional, near future): introduce a "remote game" plugin path for selected games:
    - Build step emits game bundles to a CDN bucket `games/<slug>/<version>/index.js`.
    - Backend (or a static file) serves a `games-manifest.json` with URLs.
    - Frontend uses `dynamic import()` to load the game module at runtime based on the manifest.
- Stage C (later, if needed): evolve to Module Federation or per-game services.

This lets you ship new games (or rollback) by updating CDN assets/manifests, without a full frontend rebuild, while
preserving an easy monorepo for shared utilities.

### Required Firebase credential secrets

The backend reads Firebase Admin credentials from individual Secret Manager entries (mapped via `--set-secrets`). Create
them once, then update versions as needed:

```bash
gcloud secrets create NEXT_FIREBASE_CREDS_TYPE --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_PROJECT_ID --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_PRIVATE_KEY_ID --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_PRIVATE_KEY --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_CLIENT_EMAIL --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_CLIENT_ID --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_AUTH_URI --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_TOKEN_URI --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_AUTH_PROVIDER_X509_CERT_URL --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_CLIENT_X509_CERT_URL --replication-policy=automatic
gcloud secrets create NEXT_FIREBASE_CREDS_UNIVERSE_DOMAIN --replication-policy=automatic

# Add versions with appropriate values from your Firebase service account JSON
echo -n "service_account" | gcloud secrets versions add NEXT_FIREBASE_CREDS_TYPE --data-file=-
echo -n "<project-id>" | gcloud secrets versions add NEXT_FIREBASE_CREDS_PROJECT_ID --data-file=-
echo -n "<private_key_id>" | gcloud secrets versions add NEXT_FIREBASE_CREDS_PRIVATE_KEY_ID --data-file=-
echo -n "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" | gcloud secrets versions add NEXT_FIREBASE_CREDS_PRIVATE_KEY --data-file=-
echo -n "<client_email>@<project-id>.iam.gserviceaccount.com" | gcloud secrets versions add NEXT_FIREBASE_CREDS_CLIENT_EMAIL --data-file=-
echo -n "<client_id>" | gcloud secrets versions add NEXT_FIREBASE_CREDS_CLIENT_ID --data-file=-
echo -n "https://accounts.google.com/o/oauth2/auth" | gcloud secrets versions add NEXT_FIREBASE_CREDS_AUTH_URI --data-file=-
echo -n "https://oauth2.googleapis.com/token" | gcloud secrets versions add NEXT_FIREBASE_CREDS_TOKEN_URI --data-file=-
echo -n "https://www.googleapis.com/oauth2/v1/certs" | gcloud secrets versions add NEXT_FIREBASE_CREDS_AUTH_PROVIDER_X509_CERT_URL --data-file=-
echo -n "https://www.googleapis.com/robot/v1/metadata/x509/<sa_name>@<project-id>.iam.gserviceaccount.com" | gcloud secrets versions add NEXT_FIREBASE_CREDS_CLIENT_X509_CERT_URL --data-file=-
echo -n "googleapis.com" | gcloud secrets versions add NEXT_FIREBASE_CREDS_UNIVERSE_DOMAIN --data-file=-
```

Ensure the Cloud Run runtime service account and CI deploy service account have `roles/secretmanager.secretAccessor`.

### Logging in production

The backend attempts to ship logs to Logstash only when explicitly enabled. To keep prod quiet by default, the
`logback-spring.xml` prod profile reads `LOGSTASH_ENABLED`:

```bash
# default (no Logstash over TCP)
# to enable later:
gcloud run deploy "$SERVICE" \
  --region="$REGION" \
  --image="$IMAGE" \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod,LOGSTASH_ENABLED=true,LOGSTASH_HOST=<host>,LOGSTASH_PORT=5000
```

If `LOGSTASH_ENABLED` is not set to `true`, only console logging is active in Cloud Run.

### Verifying the deployed backend

After a successful deploy, the service root `/` is protected by Spring Security and will return `401 Unauthorized`.
Use the public health-like endpoint and actuator health check:

```bash
SERVICE_URL=${BACKEND_URL}
curl -sS "$SERVICE_URL/healthz"
curl -sS "$SERVICE_URL/actuator/health"
```

### GitHub Actions CI/CD

- Repository secrets (Settings → Secrets and variables → Actions):
    - `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY` (JSON). Prefer WIF for keyless in production.
    - Optional variables: `AR_REPO` (default `games`), `BACKEND_SERVICE` (default `games-backend`), `FRONTEND_SERVICE` (
      default `games-frontend`), `NEXT_PUBLIC_API_URL`.
- The workflow `.github/workflows/ci-cd.yml` builds images, pushes to AR, and deploys to Cloud Run on pushes to `main`
  when secrets exist.

## Troubleshooting

- Ensure Docker Postgres is healthy: `docker ps` and `docker logs games_postgres`
- If frontend cannot reach backend, verify `BACKEND_URL` and CORS origins
- When Playwright fails, start dev server before running tests
- If Testcontainers pulls are slow, pre-pull `postgres:15-alpine`
- If Cloud Run deploy fails: confirm `GCP_PROJECT_ID`, `GCP_REGION`, and `GCP_SA_KEY` secrets; ensure the Artifact
  Registry repo exists and you ran `gcloud auth configure-docker <region>-docker.pkg.dev` locally.

## Cloud services, variables and secrets

Below is a checklist of required variables/secrets and how to obtain them.

### Frontend (Next.js)

- `NEXTAUTH_URL` (secret): canonical site URL (e.g., https://app.example.com).
- `NEXTAUTH_SECRET` (secret): generate with `openssl rand -base64 32`.
- `NEXT_PUBLIC_API_URL` (variable): base URL to backend API (e.g., https://api.example.com/api or the Cloud Run backend
  URL + `/api`).
- Stripe (optional; behind `payments.stripe_enabled`):
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (variable): from Stripe Dashboard → Developers → API keys.
    - `STRIPE_SECRET_KEY` (secret): Stripe secret key (store in Secret Manager / GitHub Actions secret).
    - `STRIPE_WEBHOOK_SECRET` (secret): after creating a webhook endpoint in Stripe (test mode), copy the signing
      secret.

### Backend (Spring Boot)

- Database (Cloud SQL):
    - `SPRING_DATASOURCE_URL`: jdbc:postgresql://<PRIVATE_IP_OR_PROXY>/<DB_NAME>
    - `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` (Secret Manager / Actions secret).
- JWT:
    - `APP_JWT_SECRET` (secret) and `APP_JWT_EXPIRATION_MS` (e.g., 86400000).
- Feature flags:
    - Unleash (default): `UNLEASH_URL`, `UNLEASH_INSTANCE_ID`/token (if secured). Or rely on built-in overlay +
      `application.yml` defaults.
    - flagd (dev only): `FLAGD_ENDPOINT` (optional).
- Redis (optional): `REDIS_HOST`, `REDIS_PORT` (Memorystore). Enable with `features.cache.redis_enabled=true`.
- Stripe (optional): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### GCP (CI/CD)

- `GCP_PROJECT_ID` (secret): GCP project ID (e.g., my-project-123).
- `GCP_REGION` (secret): GCP region (e.g., us-central1).
- `GCP_SA_KEY` (secret): JSON key for a service account with roles: Cloud Run Admin, Cloud Build Editor, Artifact
  Registry Writer, Secret Manager Accessor.
    - Recommended: switch to Workload Identity Federation to avoid JSON keys.

## Feature Flags provider

Default: **Unleash** (production/staging). Optional: **flagd** (dev/local).

Pros Unleash: battle-tested, UI & strategies (gradual, constraints), Postgres store, good Spring integration.
Cons: extra service to host.

Pros flagd: light & fast for local, spec-compliant (OpenFeature).
Cons: fewer strategies/UI; better for dev than prod.

We will progressively enable external providers via flags:

- `payments.stripe_enabled`: internal → Stripe; cohort rollouts supported.
- `cache.redis_enabled` / `kv.redis_enabled`: in-proc Caffeine → Memorystore.
- `db.external_enabled`: dev embedded DB → Cloud SQL in prod.
- `mail.provider`: smtp | ses | mailgun.
- `realtime.provider`: spring-ws | managed; fallback to polling.

## Contributing

- Pre-commit hooks will lint and format staged files.
- Keep semicolons and braces per ESLint rules; prefer clarity.

## Observability Profile (optional)

To run the observability stack only when needed, use Docker Compose profiles:

```bash
# Start core stack (Postgres, Redis, backend, frontend)
docker compose up -d

# Start with observability (Elasticsearch, Logstash, Kibana, Prometheus, Grafana, Filebeat)
docker compose --profile observability up -d

# Later, stop only observability services
docker compose --profile observability stop
```

Services behind the `observability` profile:

- Elasticsearch, Logstash, Kibana (ELK)
- Prometheus, Grafana
- Filebeat

The core application services run without this profile.

## Games in App Router

All games are consolidated under the Next.js App Router at `frontend/app/games`:

- `/games` — gallery
- `/games/snake` — Snake
- `/games/memory` — Memory
- `/games/breakout` — Breakout

Game components remain authored under `games/*` packages and are imported via monorepo aliases configured in
`next.config.ts`.

## Bun as the JS runtime

This repo is standardized on Bun. Typical commands:

```bash
bun install
bun run dev
bun run build
bun run test
```

## Brand color palette (GameHub)

Order of importance and usage mapping (light and dark supported via CSS variables in `frontend/app/globals.css` and
Tailwind `theme.extend.colors`):

- Primary — Auburn (used for `--primary`): strong, accessible red family for key actions and highlights.
- Accent — Royal Blue (used for `--accent`): emphasis, chips, links, gradients with primary.
- Secondary — Purple: secondary surfaces and components.
- Royal Orange → Royal Green → Emerald → Gold → Indigo: supporting hues for tags, states, and data viz.
- Neutrals — Black, Dark Grey, White: foreground/background and borders.

These tokens are wired to shadcn/ui semantic colors (`bg-primary`, `text-primary`, `bg-accent`, etc.) for consistency.

## Next steps: UX and multiplayer enhancements

Planned, feature-flagged improvements for engagement:

- UX: pause/resume, touch controls, sound/music toggles, difficulty presets, persistent high scores
- Social: session-based nicknames, shareable score cards
- Realtime: basic presence and live leaderboard via backend WebSocket channel

Please confirm which game to prioritize for the first multiplayer prototype (Snake or Breakout recommended). Once
confirmed, we’ll wire the backend WS topic, add client hooks, and ship tests (integration + e2e).

# Frontend (Cloud Run) — Build & Deploy from Monorepo

The frontend uses a monorepo‑aware Dockerfile and must be built from the repository root so local workspace packages (
`libs/`, `games/`) are available to the build.

Important notes:

- Always run `docker build` from the repo root with `-f frontend/Dockerfile.monorepo .` (trailing dot is the context).
- The runtime image includes both Next.js standalone output and a robust launcher that prefers the standalone server but
  will fall back to `next start` if needed. It binds to `0.0.0.0` on the port exposed by Cloud Run (`$PORT`).
- Set `NEXT_PUBLIC_API_URL` to the backend base URL that includes `/api`. For production in this project, use:

```
NEXT_PUBLIC_API_URL=${BACKEND_URL}/api
```

Build and push (Artifact Registry):

```
docker build --no-cache \
  -t ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  -f frontend/Dockerfile.monorepo .

docker push ${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA}
```

Deploy to Cloud Run:

```
gcloud run deploy ${SERVICE_FRONT} \
  --region=${REGION} \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/games/games-frontend:${SHA} \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

What happens at runtime:

- The image contains `.next/standalone` and the full `.next` build artifacts, plus `node_modules`.
- An entrypoint script under `/app/standalone/run.sh` tries common standalone server filenames first (e.g., `server.js`,
  `server.mjs`, `server/index.js`).
- If no standalone entry is found, it runs `next start -H 0.0.0.0 -p $PORT` from the bundled `node_modules` with the
  copied `.next` assets.

Troubleshooting (frontend):

- If Cloud Run says the container didn’t listen on the expected port, open the revision logs. You should see
  `[launcher]` messages:
    - `Found standalone entry: ...` → standalone startup.
    - `Falling back to Next CLI from: ...` → `next start` fallback.
- Verify you deployed the frontend with `--port=8080` and that `NEXT_PUBLIC_API_URL` points at a reachable backend URL (
  ending with `/api`).
- Ensure you built from the repository root; otherwise, the monorepo workspaces won’t resolve.

# CI/CD (GitHub Actions)

This repo ships a single workflow at `.github/workflows/ci-cd.yml` which:

- Runs backend tests (Maven) and frontend lint/tests/build
- Builds and pushes images to Artifact Registry
- Deploys `games-backend` and `games-frontend` to Cloud Run

Provide these repository variables and secrets:

- Secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY` (JSON), and DB secret names used in the backend deploy step
- Vars: `AR_REPO=games`, `BACKEND_SERVICE=games-backend`, `FRONTEND_SERVICE=games-frontend`,
  `NEXT_PUBLIC_API_URL=https://games-backend-245231653364.northamerica-northeast1.run.app/api`

On a push to `main`, the workflow will build, push, and deploy. The frontend step sets `--port=8080` and passes
`NEXT_PUBLIC_API_URL` to the container.

## Testing (frontend)

- Unit/Integration: React Testing Library (RTL)
- E2E: Playwright

Relevant e2e specs (run with `bun run test:e2e` or `pnpm test:e2e` in `frontend/`):

- `tests-e2e/access-control.spec.ts` — verifies that `/` and `/projects` are public and that a private route (e.g.,
  `/dashboard`) redirects to `/login?redirect=...` via Edge Middleware.

# What changed and why (Frontend runtime)

- The container now starts via `frontend/docker/run.sh`, which:
    - Prefers the Next.js standalone server entry when present (`.next/standalone`)
    - Falls back to `next start` using the copied `.next` assets and full `node_modules` when standalone isn’t emitted
- We added `assetPrefix: '/'` in `next.config.*` so static assets and chunks are requested with absolute paths (
  `/_next/...`), fixing 404s on nested routes in Cloud Run.

With these changes, the service reliably binds to `0.0.0.0:$PORT`, passes health checks, and the UI loads its chunks and
styles correctly.
