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
