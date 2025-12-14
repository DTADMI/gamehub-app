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

CI/CD quick facts:

- Single workflow: `.github/workflows/ci-cd.yml` handles tests, a single Docker build, push (Docker Hub optional, GCP
  AR), and Cloud Run deploy.
- Auth options (choose one):
    - Service Account key secrets: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY` (JSON). Roles: Cloud Run Admin, Artifact
      Registry Writer, Service Account Token Creator.
    - Workload Identity Federation: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_WORKLOAD_IDENTITY_PROVIDER`,
      `GCP_SERVICE_ACCOUNT` (+ `roles/iam.workloadIdentityUser`).
- Runtime SA for Cloud Run: set `CLOUD_RUN_SERVICE_ACCOUNT` repo variable to an SA email; otherwise the deployer SA is
  used. If runtime SA ≠ deployer SA, grant the deployer `roles/iam.serviceAccountUser` on the runtime SA.
- Required APIs: `run.googleapis.com` and `artifactregistry.googleapis.com`. The workflow attempts to enable them and
  fails with a concise message if it cannot.
- Minimal logging: the workflow avoids job summaries and verbose environment dumps; errors surface directly from
  gcloud/Docker steps for clarity.
- Deploy gating: Deploy runs on `main` (or manual dispatch) only when GCP auth is available. Manual dispatch does not
  bypass authentication. Docker Hub is an optional mirror used only if AR is unavailable or if the AR job fails; Cloud
  Run deploys always pull from Artifact Registry.
