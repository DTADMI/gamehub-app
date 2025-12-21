# GameHub — Next.js Frontend

GameHub is a Next.js 16 frontend where you can play my web games and browse my other projects. This repository is the
frontend only (not a monorepo). It is backend‑agnostic and talks to a separate API via a single environment variable.

This guide helps a newcomer run the frontend locally, test it, and deploy it to Google Cloud Run both manually and via
GitHub Actions. It also documents the technological choices and trade‑offs made for this project.

Important defaults used here:

- Backend listens on port 8080 locally.
- Frontend listens on port 3000 locally.

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
10. Sounds (fail‑safe manager)
11. Breakout — Boosters & Particles

— — —

Game design docs

- Rite of Discovery
  - Design: docs/rite-of-discovery.md
  - Designer/Animator Brief (EN+FR): docs/rite-of-discovery-designer-brief.md
  - Stories & Scenarios Tracker: docs/rite-of-discovery-stories.md
- Systems Discovery
  - Design: docs/systems-discovery/systems-discovery-design.md
  - Designer/Animator Brief (EN+FR): docs/systems-discovery/systems-discovery-designer-brief.md
  - Stories & Scenarios Tracker: docs/systems-discovery/systems-discovery-stories.md
  - Packs: Core • Space • Ocean • Body Systems (Breath, Fuel, Move, Signal & Defend, Grow)
- Toymaker Escape
  - Design: docs/toymaker-escape/toymaker-escape-design.md
  - Designer/Animator Brief (EN+FR): docs/toymaker-escape/toymaker-escape-designer-brief.md
  - Stories & Scenarios Tracker: docs/toymaker-escape/toymaker-escape-stories.md
- Human History — Many Hands Make History
- Design: docs/human-history/human-history-design.md
- Designer/Animator Brief (EN+FR): docs/human-history/human-history-designer-brief.md
- Stories & Scenarios Tracker: docs/human-history/human-history-stories.md
- Africa Prehistory — Paths of Many
- Design: docs/africa-prehistory/africa-prehistory-design.md
- Designer/Animator Brief (EN+FR): docs/africa-prehistory/africa-prehistory-designer-brief.md
- Stories & Scenarios Tracker: docs/africa-prehistory/africa-prehistory-stories.md

— — —

1. Prerequisites

- Node.js 20+
- pnpm (recommended; Corepack can enable it automatically) or npm
- Docker and `gcloud` CLI (for Cloud Run)
- A Google Cloud project with Artifact Registry and Cloud Run enabled

2. Environment variables

Create a `.env.local` (for local dev) with at least:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GITHUB_URL=https://github.com/DTADMI
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/in/darryl-ulrich-t-62358476/
NEXT_PUBLIC_CONTACT_EMAIL=dtadmi@gmail.com

# NextAuth (server-only; do NOT prefix with NEXT_PUBLIC)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_strong_random_value

# OAuth providers (optional; server-only)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

Notes:

- `NEXT_PUBLIC_API_URL` must point to your backend base URL and include the `/api` suffix. For local development the
  backend is expected on port 8080.
- Additional optional envs are documented in `.env.example`.
- OAuth provider secrets must NOT be exposed as `NEXT_PUBLIC_*`. Store them as GitHub Actions secrets for CI/CD and as
  environment variables on Cloud Run.

### Auth callbacks (Google/GitHub)

Set the following authorized callback URLs in your OAuth apps:

- Local: `http://localhost:3000/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/github`
- Prod: `https://<your-frontend-domain>/api/auth/callback/google` and
  `https://<your-frontend-domain>/api/auth/callback/github`

Email/password uses the Java backend endpoints via the Credentials provider:

- Sign in: `POST ${NEXT_PUBLIC_API_URL}/auth/signin`
- Sign up: `POST ${NEXT_PUBLIC_API_URL}/auth/signup`
- Refresh: `POST ${NEXT_PUBLIC_API_URL}/auth/refresh`
- Me: `GET ${NEXT_PUBLIC_API_URL}/auth/me`

Frontend route: `/signin` — a single page with tabs (Sign In/Sign Up), Google/GitHub buttons, “Forgot password” link,
and Terms/Privacy note. The flow completes on the frontend and redirects back to the app via `callbackUrl`.

3. Local development

Install and run the frontend on port 3000:

```
pnpm i
pnpm dev
# → http://localhost:3000
```

Point it to a running backend (port 8080):

```
export NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Mobile‑first game UX (important):

- All canvas games run inside a locked container to prevent page scroll/zoom while playing.
- Buttons and tap targets meet a 44px minimum height for comfortable touch.
- Canvases are high‑DPI aware and scale crisply on DPR 1/2/3; the CSS size fits the container width.
- Breakout and Snake include a tap‑to‑start/pause overlay on mobile for smooth interaction.

Layout and footer (UX updates):

- The root layout uses a sticky footer and tighter vertical spacing so most pages fit within a single screen or require
  at most a short scroll.
- The footer is compact by default with a “More” toggle to reveal additional links and the newsletter form.

Particles in games:

- Optional particle effects can be toggled per game from the control bar under the canvas.
- You can also choose the effect style: `Sparks` or `Puff`. Breakout emits your selected effect when bricks are
  destroyed.

Local backend fallback (optional but recommended):

- Start a local backend automatically (pulls latest image from Artifact Registry, falls back to Docker Hub):

  ```bash
  pnpm backend:up
  # Frontend will use http://localhost:8080/api
  ```

- Stop the helper container:

  ```bash
  pnpm backend:down
  ```

- Full local stack with Postgres via Compose:

  ```bash
  docker compose up -d
  # db on 5432, backend on 8080
  ```

4. Testing (Playwright e2e)

We include Playwright in devDependencies and a smoke test suite that:

- Opens each `/games/<slug>` route.
- Asserts a container with `role="application"` renders.
- Verifies pressing Space doesn’t scroll the page (thanks to the shared key‑capture helper).

Featured playable games (MVP)

- Breakout
- Memory
- Snake
- Pattern Matching (formerly Knitzy)
- Bubble Pop
- Checkers
- Chess

Run e2e tests:

```
pnpm exec playwright install --with-deps
pnpm test:e2e
```

Notes for E2E stability:

- The Playwright webServer in `playwright.config.ts` starts the Next.js dev server with
  `NEXT_PUBLIC_DISABLE_PROVIDERS=true`.
  - This intentionally disables external providers (Firebase Auth and the Subscription/GraphQL fetch) during E2E to
    avoid client‑side exceptions caused by missing cloud credentials, CORS, or backend availability.
  - Public pages like `/` and `/projects` still render normally; protected routes are tested via middleware redirects.
  - This flag is only used for E2E. Production builds and normal local dev do not set it.

Health‑gate for backend during E2E:

- `tests-e2e/global-setup.ts` checks the backend health at `${NEXT_PUBLIC_API_URL.replace(/\/api$/, "")}`.
- When targeting localhost and `E2E_PUBLIC_MODE=false`, it will auto‑start the local backend via `pnpm backend:up`
  helper
  and wait briefly for health before running tests.
  - Set `E2E_PUBLIC_MODE=true` to skip any local backend attempts (e.g., when testing against a hosted backend).

5. Build & production run

```
pnpm build
pnpm start  # starts on port 3000
```

Routing and prerendering notes:

- The page at `/account/subscribe/success` depends on the authenticated user’s subscription at runtime (used to refresh
  entitlements after checkout).
  - It is explicitly marked as dynamic via:
    ```ts
    // app/account/subscribe/success/page.tsx
    export const dynamic = "force-dynamic";
    ```
  - This prevents static prerender during `next build` and avoids the error
    `useSubscription must be used within SubscriptionProvider` that can occur when running context hooks at build time.

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

6. Deploy to Google Cloud Run (manual)

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
  --port=3000 \
  --set-env-vars=NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api
```

7. Deploy to Google Cloud Run (GitHub Actions)

This repo includes a single consolidated workflow: `.github/workflows/ci-cd.yml`.

What it does (high level):

- Runs lint, unit/integration tests, and a Playwright E2E smoke suite.
- Builds the Docker image once, saves it as an artifact, and pushes to registries:
  - Primary: Google Artifact Registry (AR) in your GCP project.
  - Optional mirror: Docker Hub, but only when AR is not available OR if the AR push/deploy step fails (fallback
    mirror).
- Deploys to Cloud Run (frontend service) on pushes to `main` or manual dispatch (deploys from AR only and only when GCP
  auth is available).

Environment and gating:

- Frontend service name: `FRONTEND_SERVICE` repo variable (default `gamehub-app`).
- Artifact Registry repo: `GCP_ARTIFACT_REPO` repo variable (default `gamehub`).
- Deploy runs only when a valid GCP auth method is present. Manual dispatch does not bypass authentication.
  - Docker Hub is never used as a deploy source; it serves solely as a mirror for discoverability and as a fallback
    artifact when AR is unavailable or AR push/deploy fails.
- Required Google APIs: `run.googleapis.com` and `artifactregistry.googleapis.com`.
  - CI does not auto-enable these APIs by default. A Project Owner should enable them once:
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com --project $PROJECT
    ```
  - Optional: you may opt‑in to enabling from CI by setting a repository variable `ENABLE_GCP_APIS=true`. Your deploy
    service account must have sufficient permissions to enable services (typically Project Editor/Owner). For least
    privilege, prefer enabling once outside CI and leave this flag unset.

Authentication options (choose ONE):

1. Service Account key (simple)

- Secrets:
  - `GCP_PROJECT_ID`
  - `GCP_REGION`
  - `GCP_SA_KEY` (entire JSON key content, multi‑line supported)
- Required SA roles (project level):
  - Cloud Run Admin
  - Artifact Registry Writer
  - Service Account Token Creator

2. Workload Identity Federation (recommended, keyless)

- Secrets:
  - `GCP_PROJECT_ID`
  - `GCP_REGION`
  - `GCP_WORKLOAD_IDENTITY_PROVIDER` (full resource name)
  - `GCP_SERVICE_ACCOUNT` (email)
- IAM: grant `roles/iam.workloadIdentityUser` for the GitHub OIDC principal to the service account, plus the roles
  above.

Runtime service account (Cloud Run):

- By default the workflow deploys with `--service-account` explicitly set to:
  - The repo variable `CLOUD_RUN_SERVICE_ACCOUNT` if provided; otherwise
  - The deployer identity (the same SA used to authenticate the job), which avoids extra API calls.
- If the runtime SA differs from the caller SA, ensure the caller has `roles/iam.serviceAccountUser` on the runtime SA.
  - The workflow prints an exact `gcloud iam service-accounts add-iam-policy-binding` command if this is missing.

Other required inputs for deploy:

- Repo variable `NEXT_PUBLIC_API_URL` — points to your backend base and must end with `/api`.

Operational notes and safety:

- The workflow uses minimal logging (no job summaries). Failures are reported directly by gcloud/Docker steps.
- We intentionally avoid dumping environment variables or secret contents to logs.
- Playwright E2E starts the dev server with `NEXT_PUBLIC_DISABLE_PROVIDERS=true` so public pages don’t attempt cloud
  auth during tests.
- Docker Hub usage is conditional:
  - When AR auth is unavailable (e.g., missing GCP secrets), the pipeline pushes to Docker Hub if `DOCKERHUB_USERNAME`
    and `DOCKERHUB_TOKEN` are provided.
  - If AR push/deploy fails, a fallback step pushes the same image to Docker Hub to ensure an artifact is published for
    debugging/local pulls. Cloud Run deployments still exclusively use AR.

Workflow split for PRs vs. main:

- `.github/workflows/ci-pr.yml` — runs on pull requests: lint, type‑check, unit/Vitest, and build (no deploy).
- `.github/workflows/test-e2e.yml` — runs Playwright mobile smokes on pull requests and manual dispatch.
- `.github/workflows/ci-cd.yml` — full pipeline on pushes to `main` (and manual dispatch): test, build‑once, push (AR
  primary, Docker Hub fallback), and deploy to Cloud Run on port 3000.

8. Design choices and trade‑offs

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

9. Troubleshooting

- Hydration warnings
  - Ensure any client‑only UI (theme toggles etc.) uses deterministic SSR markup. We fixed Footer imports and heading
    classes to remove drift.
- Space bar scrolls the page while playing
  - Each game page uses a focusable container + shared input capture. If you add a new game, copy that wrapper.
- 404 importing `@games/*`
  - Check `tsconfig.json` `paths` and `next.config.ts` webpack aliases. Games live under `games/<id>/src`.
- Cloud Run shows a 404 on nested routes
  - Ensure the container serves on `PORT=3000` and that you haven’t configured a basePath/assetPrefix incorrectly.
    This repo serves with `next start -p 3000`.

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
# Next.js listens on PORT provided by Cloud Run; we deploy the service listening on 3000.
gcloud run deploy gamehub-app \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA} \
  --allow-unauthenticated \
  --port=3000 \
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
  -t ${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA} \
  -f frontend/Dockerfile \
  .

docker push ${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA}

gcloud run deploy gamehub-app \
  --region=$REGION \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA} \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://<backend-domain>/api
```

Notes:

- For fully reproducible installs, generate and commit `frontend/bun.lockb` (run `bun --cwd frontend install` once, then
  commit the lockfile).
- The existing `frontend/Dockerfile` remains useful for local iteration when you copy or publish dependencies into the
  frontend, but for the current monorepo layout prefer `frontend/Dockerfile.monorepo`.

#### Troubleshooting: Cloud Run container didn’t listen on the expected port (frontend 3000)

Next.js `next start` listens on port 3000 by default. Cloud Run health checks expect your container to listen on the
port provided in the `PORT` environment variable (we deploy the frontend on 3000). You can fix this in one of two ways:

- Easiest: deploy the frontend with `--port=3000` (as shown above) so Cloud Run targets 3000 for health checks and
  traffic.
- Alternatively: change the frontend start script to bind to the `PORT` env automatically so no `--port` flag is needed:

  ```json
  {
    "scripts": {
      "start": "next start -p ${PORT:-3000}"
    }
  }
  ```

With the script change, Cloud Run will set `PORT` and the app will listen on it (3000 in our deployment).

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
  - `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SERVICE_ACCOUNT_KEY` (JSON). Prefer WIF for keyless in production.
  - Optional variables: `AR_REPO` (default `gamehub`), `BACKEND_SERVICE` (default `gamehub-api`), `FRONTEND_SERVICE` (
    default `gamehub-app`), `NEXT_PUBLIC_API_URL`.
- The workflow `.github/workflows/ci-cd.yml` builds images, pushes to AR, and deploys to Cloud Run on pushes to `main`
  when secrets exist.

## Troubleshooting

- Ensure Docker Postgres is healthy: `docker ps` and `docker logs games_postgres`
- If frontend cannot reach backend, verify `BACKEND_URL` and CORS origins
- When Playwright fails, start dev server before running tests
- If Testcontainers pulls are slow, pre-pull `postgres:15-alpine`
- If Cloud Run deploy fails: confirm `GCP_PROJECT_ID`, `GCP_REGION`, and `GCP_SERVICE_ACCOUNT_KEY` secrets; ensure the
  Artifact
  Registry repo exists and you ran `gcloud auth configure-docker <region>-docker.pkg.dev` locally.

### Display crispness (DPR/rotation)

If canvas graphics appear blurry, especially after rotating a mobile device:

- Ensure canvases are sized with the device pixel ratio on resize and the transform is reset:
  - Physical size: `canvas.width = logicalW * dpr; canvas.height = logicalH * dpr;`
  - Rendering scale: `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` immediately after resizing.
- CSS should scale the canvas to fit the container without stretching:
  - `style="max-width: 100%; height: auto"` (or equivalent class names).
- Rotation checks:
  - Verify the resize handler runs on orientation change and reapplies `setTransform`.
  - No debounce is necessary; the work is light and idempotent.
- Backend URL sanity: `NEXT_PUBLIC_API_URL` must end with `/api` so the GraphQL client can reach `${API_BASE}/graphql`.

Particles note: Optional particle effects are OFF by default and can be toggled in the in‑app Settings under the game
container. Effects are pooled and lightweight, but leave them off on very low‑end devices if you notice frame drops.

### Breakout bricks layout

Breakout’s brickfield is now responsive and centered. The game computes the number of columns and brick width from the
logical canvas width so bricks evenly fill the row without awkward left alignment. No configuration is required.

### Page layout and footer

Game pages have tighter vertical spacing to reduce unnecessary scrolling. The global footer is compact by default and
uses collapsible sections on mobile, helping most pages fit within a single screen or a short scroll.

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
- `GCP_SERVICE_ACCOUNT_KEY` (secret): JSON key for a service account with roles: Cloud Run Admin, Cloud Build Editor,
  Artifact
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

## Brand color palette and themes (GameHub)

Order of importance and usage mapping (light and dark supported via CSS variables in `frontend/app/globals.css` and
Tailwind `theme.extend.colors`):

- Primary — Auburn (used for `--primary`): strong, accessible red family for key actions and highlights.
- Accent — Royal Blue (used for `--accent`): emphasis, chips, links, gradients with primary.
- Secondary — Purple: secondary surfaces and components.
- Royal Orange → Royal Green → Emerald → Gold → Indigo: supporting hues for tags, states, and data viz.
- Neutrals — Black, Dark Grey, White: foreground/background and borders.

These tokens are wired to shadcn/ui semantic colors (`bg-primary`, `text-primary`, `bg-accent`, etc.) for consistency.

### Light/Dark themes — backgrounds and rationale

- Light theme: a warm star‑glow background. We render a subtle radial glow (golden/royal‑orange) over a bright surface
  to evoke “illuminated by a star” while preserving contrast for text and controls. Alternatives (cool glow or minimal
  flat with vignette) are documented as commented variants in `app/globals.css`.
- Dark theme: a CSS‑only galaxy background. Layered radial gradients create distant nebulae; two repeating radial layers
  add sparse tiny stars; a deep space gradient forms the base. There are no image assets; everything is vector/gradient
  for performance and simplicity.

Where to change tokens/backgrounds:

- Edit `app/globals.css`:
  - Palette variables (order requested): `--c-purple`, `--c-auburn`, `--c-royal-blue`, `--c-emerald`,
    `--c-royal-orange`, `--c-indigo`, `--c-royal-green`, `--c-pink`, `--c-red`, `--c-salmon`, `--c-black`, `--c-white`,
    `--c-grey-*`.
  - Semantic mappings: `--background`, `--foreground`, `--card`, `--primary`, `--accent`, `--muted`, `--border`,
    `--ring`, etc. in `:root` (light) and `.dark` (dark).
  - Background layers via `--app-bg` (light star‑glow vs dark galaxy). The `body` uses `background-image: var(--app-bg)`
    so the effect applies globally.

Accessibility and contrast:

- Body text meets ≥ 4.5:1 contrast in both themes; large headings and UI chrome target ≥ 3:1. Panels use `bg-card` with
  subtle translucency and `backdrop-blur` to float over the rich backgrounds without harming readability.

Game cards (catalog) are fully clickable:

- The entire card links to `/games/[slug]` while the Play button remains as an explicit CTA. Keyboard users can focus
  the card (visible ring) and press Enter/Space; middle‑click/open‑in‑new‑tab works natively. See
  `components/game-card.tsx`.

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
  -t ${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA} \
  -f frontend/Dockerfile .

docker push ${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA}
```

Deploy to Cloud Run:

```
gcloud run deploy ${SERVICE_FRONT} \
  --region=${REGION} \
  --image=${REGION}-docker.pkg.dev/${PROJECT}/gamehub/gamehub-app:${SHA} \
  --allow-unauthenticated \
  --port=3000 \
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
- Verify you deployed the frontend with `--port=3000` and that `NEXT_PUBLIC_API_URL` points at a reachable backend URL (
  ending with `/api`).
- Ensure you built from the repository root; otherwise, the monorepo workspaces won’t resolve.

# CI/CD (GitHub Actions)

This repo ships a single workflow at `.github/workflows/ci-cd.yml` which:

- Runs backend tests (Maven) and frontend lint/tests/build
- Builds and pushes images to Artifact Registry
- Deploys `gamehub-api` and `gamehub-app` to Cloud Run

Provide these repository variables and secrets:

- Secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SERVICE_ACCOUNT_KEY` (JSON), and DB secret names used in the backend
  deploy step
- Vars: `AR_REPO=gamehub`, `BACKEND_SERVICE=gamehub-api`, `FRONTEND_SERVICE=gamehub-app`,
  `NEXT_PUBLIC_API_URL=https://gamehub-api-245231653364.northamerica-northeast1.run.app/api`

On a push to `main`, the workflow will build, push, and deploy. The frontend step sets `--port=3000` and passes
`NEXT_PUBLIC_API_URL` to the container.

## Testing (frontend)

- Unit/Integration: React Testing Library (RTL)
- E2E: Playwright

Relevant e2e specs (run with `pnpm test:e2e` at repo root):

- `tests-e2e/smoke.spec.ts` — home route smoke
- `tests-e2e/breakout.spec.ts` — Breakout paddle/pause smokes
- `tests-e2e/memory.spec.ts` — Memory flip two cards, moves increments
- `tests-e2e/snake.spec.ts` — Snake canvas visible and HUD shows Score after simple input
- `tests-e2e/knitzy.spec.ts` — Pattern Matching (redirects from /games/knitzy) painting updates progress
- `tests-e2e/bubble-pop.spec.ts` — Bubble Pop popping increases score text
- `tests-e2e/checkers.spec.ts` — Checkers board renders
- `tests-e2e/chess.spec.ts` — Chess board renders

# Admin Dashboard (frontend-only) and Feature Flags

Purpose

- Operate the app via an Admin profile: feature flagging, per‑game enable/disable, UI defaults, and gameplay tunables —
  without a backend dependency for the first iteration.

Status: frontend‑only MVP (local persistence)

- Flags are stored in `localStorage` and can be exported/imported as JSON.
- Admin route: `/admin` (guarded by NextAuth role `ADMIN`). In dev you can enable a local role override for testing.
- Tabs: Feature Flags, Runtime Config (numeric/range tunables), Users (stub), Audit Log (local export).

Example schema (subject to evolution)

```
{
  "version": 1,
  "games": {
    "breakout": { "enabled": true, "upcoming": false },
    "memory":   { "enabled": true, "upcoming": false },
    "snake":    { "enabled": true, "upcoming": false }
  },
  "ui": {
    "showCardPlayOverlay": true,
    "showParticlesControl": { "breakout": true, "memory": false, "snake": false }
  },
  "breakout": {
    "enableParticlesDefault": true,
    "particleEffectDefault": "sparks",
    "powerupDropRate": 0.06
  },
  "snake": { "defaultControlScheme": "swipe" },
  "features": { "experimental": { "colorMatchBonus": true } }
}
```

How flags take effect

- Catalog and routes: `games.<slug>.enabled=false` hides the card and blocks the route with a friendly message.
- UI: `ui.showCardPlayOverlay` toggles the play overlay on game cards; `ui.showParticlesControl` hides the particle
  selector for games that don’t use particles.
- Gameplay tunables: Breakout reads `powerupDropRate`, default particle effect, etc.; Snake reads
  `defaultControlScheme`.

Roadmap to backend persistence

- Later, the Admin UI will switch from localStorage to REST endpoints on the backend (e.g., `/api/admin/flags`) with
  optimistic concurrency and audit persistence. The current schema is designed to be sent as‑is to a backend.

# Game Launcher (manifest‑driven dynamic loading)

Goal

- Standardize how games are discovered, rendered, and code‑split. The launcher uses a single manifest to describe each
  game, and pages dynamically import games at runtime.

Design

- A central manifest (TypeScript) describes: `slug`, `title`, `description`, `tags`, `dynamic import`,
  `enabled flag key`, `upcoming`, and optional assets (background, preloads).
- `/games` renders the catalog from the manifest + flags, with client‑side search/filter.
- `/games/[slug]` looks up a game in the manifest and uses `next/dynamic` to load it on demand. It shows Coming
  Soon/Disabled/Not Found states when appropriate.
- Preloading: hovering a card can trigger `rel=prefetch` for the game chunk and optionally preload SFX/images declared
  in the manifest.

Current integration

- Implemented: a central manifest at `games/manifest.ts` declares Breakout, Memory, and Snake (slug, title, description,
  tags, background, preloads, and a dynamic import factory).
- Implemented: generic route `app/games/[slug]/page.tsx` loads a game dynamically via `next/dynamic`, and shows friendly
  states for Coming Soon and Disabled games.
- Implemented: catalog page `app/games/page.tsx` now renders from the manifest (mapped to the existing `GamesList`
  component) so new games only need a manifest entry.

New MVP routes available

- Knitzy: `/games/knitzy` — stitch grid MVP (tap to stitch, score increments)
- Bubble Pop: `/games/bubble-pop` — bubble pop MVP (tap to pop, score increments)
- Checkers: `/games/checkers` — local 2‑player board MVP (rules WIP)
- Chess: `/games/chess` — local 2‑player board MVP (rules WIP)

Run locally:

```
pnpm dev
# Then open the routes listed above
```

Testing

- Playwright checks: navigation loads the dynamic chunk; disabled/upcoming states are respected; flags updated in Admin
  affect the catalog immediately after reload.

How to add a new game (quick steps)

1. Export your game component from its package/module (e.g., `@games/mygame`).
2. Add a new entry to `games/manifest.ts` with `slug`, `title`, `shortDescription`, `tags`, `image`, optional
   `backgroundImage`/`preloadAssets`, and `getComponent` that returns a dynamic import of your game.
3. The catalog will list it automatically. Visiting `/games/<slug>` will load it dynamically. To mark as Coming Soon set
   `upcoming: true`. To temporarily turn off set `enabled: false` (future Admin flags will manage this).

# Snake mobile controllers (UX)

- Default control: Swipe. A controller selector is available on the Snake page to switch between Swipe, Joystick (
  D‑pad), and Taps. The overlay appears only when selected and does not block page scrolling.

# What changed and why (Frontend runtime)

- The container now starts via `frontend/docker/run.sh`, which:
  - Prefers the Next.js standalone server entry when present (`.next/standalone`)
  - Falls back to `next start` using the copied `.next` assets and full `node_modules` when standalone isn’t emitted
- We added `assetPrefix: '/'` in `next.config.*` so static assets and chunks are requested with absolute paths (
  `/_next/...`), fixing 404s on nested routes in Cloud Run.

With these changes, the service reliably binds to `0.0.0.0:$PORT`, passes health checks, and the UI loads its chunks and
styles correctly.

10. Sounds (fail‑safe manager)

The frontend uses a small, fail‑safe SoundManager for SFX and music used by games (e.g., Breakout).

- Default paths: sound keys map to `/public/sounds/*.mp3` by default (e.g., `brickHit`, `brickBreak`, `paddle`, `wall`,
  `powerUp`, `background`).
- Lazy preload: if a sound has never been loaded before, calling `playSound('key')` triggers a single lazy preload using
  the default path.
- Fail‑safe: if a sound fails to load (404 or other error), it is marked `disabled` and will not be requested or played
  again during this session (prevents repeated network calls and console spam). Gameplay continues without audio.
- Global controls: the manager respects global mute and separate toggles for music vs. sound effects.

Public API (via `import { soundManager } from '@games/shared'`):

- `soundManager.playSound(name: string, volume?: number)` — plays a short sound if available and not disabled.
- `soundManager.playMusic(name: string, volume?: number)` — starts looping music if available and not disabled.
- `soundManager.stopMusic()` — stops current music.
- `soundManager.toggleMusic()` / `soundManager.toggleSoundEffects()` — enable/disable categories.
- `soundManager.setMuted(boolean)` / `soundManager.setVolume(0..1)` — global mute/volume.
- `soundManager.registerSound(name: string, path: string, loop?: boolean)` — register/override a sound path.
- `soundManager.isAvailable(name: string): boolean` — whether a sound is loaded and playable.
- `soundManager.isDisabled(name: string): boolean` — whether a sound was marked disabled (e.g., after a load error).
- `soundManager.enableSound(name: string)` / `soundManager.disableSound(name: string)` — force status (useful in dev).

Notes:

- Place your custom audio files under `public/sounds/` with the expected filenames if you want built‑in keys to work.
- When files are missing, you should see at most a single warning per missing key; subsequent calls will be no‑ops.
- In tests, the manager can be used with a mocked `Audio` implementation (Vitest + jsdom).

11. Breakout — Boosters & Particles

Boosters (player‑controlled speed burst):

- You get a limited number of boosters per game (default 3). The remaining count is shown in the HUD as `🚀 xN`.
- How to trigger:
  - Desktop: press `B` while playing, or click the "Boost" button under the canvas.
  - Mobile: double‑tap the canvas while playing.
- Behavior: The ball speeds up immediately and stays boosted until it contacts any brick next, then it snaps back to the
  nominal speed (including any active `Fast/Slow` modifiers and current mode scaling). The boost is disabled while the
  game is paused.

Particles:

- Toggle in the game settings strip: `Particles` checkbox.
- Style selector: `Sparks` or `Puff`. When enabled, brick hits/breaks emit the selected effect. When disabled, no brick
  particles are drawn. Victory fireworks are independent and always show for a short time after clearing a level.
- Rendering has been tuned for visibility across browsers and themes (dark/light) and uses pooled particles for
  performance.

Pause & inputs:

- When paused, the paddle does not respond to mouse/touch movement. Resume with Space (or tap the overlay on mobile).
- After losing a life (not game over), pressing Space resumes the same level (no reset to level 1).

Testing notes (Breakout):

- Playwright E2E covers:
  - Paddle immobility while paused (paddle `data-px` remains unchanged until resume).
  - Boost button decrements the HUD rocket counter.
- Unit tests cover settings persistence and UI gating for particles and modes.

12. Theme & Design Tokens (light/dark, backgrounds)

Theming in GameHub is driven by CSS variables defined in `app/globals.css`. shadcn/ui components consume semantic tokens
so the palette cascades consistently across buttons, badges, inputs, and cards.

Palette — single source of truth (order)

Defined under `:root` as OKLCH values for perceptual consistency:

- `--c-purple`, `--c-auburn`, `--c-royal-blue`, `--c-emerald`, `--c-royal-orange`, `--c-indigo`, `--c-royal-green`,
  `--c-pink`, `--c-red`, `--c-salmon`, `--c-black`, `--c-white`, `--c-grey-*`.

Semantic token mapping

- Light (`:root`):
  - `--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--border`,
    `--ring`, `--sidebar-*`
  - `--primary` = auburn, `--accent` = royal blue, `--secondary` = purple
  - Charts: `--chart-1..5` set from emerald/royal‑blue/indigo/royal‑orange/pink
- Dark (`.dark`): neutrals are deepened; foregrounds increase contrast
  - `--primary` = royal blue (for contrast), `--accent` = indigo, `--secondary` mixes indigo/purple
  - Borders/inputs muted, ring leans royal blue, same chart mapping

Backgrounds — CSS only

- Applied via `--app-bg`, used by `body { background-image: var(--app-bg) }`.
- Dark (galaxy): layered radial gradients (nebula) + two subtle repeating radial gradients (starfield) + deep space
  base.
- Light (star‑glow default): warm radial glow with royal‑orange hint over a bright surface.
- Alternatives (light):
  - Cool glow: swap orange hint for royal‑blue for a crisper, cooler look.
  - Minimal: flat bright base with faint vignette for maximal readability.

How to change tokens / backgrounds

- Edit `app/globals.css`:
  - Palette: update the `--c-*` variables in `:root` (keep the order).
  - Semantic mapping: adjust `--primary`, `--accent`, etc. in `:root` and `.dark`.
  - Backgrounds: overwrite `--app-bg` in `:root` (or `.dark`) — two light alternatives are provided as commented
    examples at the bottom of the file.

Brand alternative (dark primary)

- If you prefer brand continuity in dark mode, set `.dark { --primary: var(--c-auburn) }`. Pros: brand consistency;
  Cons: lower perceived contrast on dark surfaces.

Accessibility targets

- Body text aims for ≥ 4.5:1; large headings/UI chrome ≥ 3:1.
- Focus rings are driven by `--ring` and remain visible in both themes.

## Upcoming Projects

- Quest Hunt — Mobile-first social geocaching: create, participate in, and share location-based treasure hunts.
  - Repo: https://github.com/DTADMI/quest-hunt
  - Stack highlights: Next.js 14, TypeScript, Tailwind (shadcn/ui), MapLibre (OpenStreetMap), Supabase (Postgres +
    PostGIS, Auth, Storage, Realtime), Drizzle ORM, REST + WebSockets, Vercel, GitHub Actions, Sentry.
