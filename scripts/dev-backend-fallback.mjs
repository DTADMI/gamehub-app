#!/usr/bin/env node
/* eslint-env node */
/* global process, console, setTimeout */
/*
  Dev helper: Ensure a backend is available on localhost:8080.
  - Checks http://localhost:8080/api/health (then /actuator/health) for readiness
  - If unavailable, attempts to pull and run the latest backend image
    Preferred: Artifact Registry `${region}-docker.pkg.dev/${project}/${repo}/${service}:latest`
    Fallback:  Docker Hub `docker.io/${username}/${service}:latest`

  Environment overrides (fall back to sane defaults):
    GCP_PROJECT_ID, GCP_REGION, AR_REPO, BACKEND_SERVICE,
    DOCKERHUB_USERNAME

  Usage:
    pnpm backend:up
*/

import {execSync, spawnSync} from "node:child_process";
import http from "node:http";

const env = process.env;
const PROJECT = env.GCP_PROJECT_ID || "games-portal-479600";
const REGION = env.GCP_REGION || "northamerica-northeast1";
const AR_REPO = env.AR_REPO || "gamehub";
const SERVICE = env.BACKEND_SERVICE || "gamehub-api";
const HUB_USER = env.DOCKERHUB_USERNAME || "darryltadmi";
const CONTAINER_NAME = "gamehub-backend-latest";

const AR_IMAGE = `${REGION}-docker.pkg.dev/${PROJECT}/${AR_REPO}/${SERVICE}:latest`;
const HUB_IMAGE = `docker.io/${HUB_USER}/${SERVICE}:latest`;

function log(msg) {
  console.log(`[backend:up] ${msg}`);
}

function check(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const ok =
          res.statusCode && res.statusCode >= 200 && res.statusCode < 500;
      // consider 4xx as reachable (service exists), 5xx as not ready
      res.resume();
      resolve(ok);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function isBackendUp() {
  if (await check("http://localhost:8080/api/health")) return true;
  if (await check("http://localhost:8080/actuator/health")) return true;
  return false;
}

function docker(args, opts = {}) {
  return spawnSync("docker", args, {stdio: "inherit", ...opts});
}

function tryRemoveExisting(name) {
  try {
    execSync(`docker rm -f ${name}`, {stdio: "ignore"});
  } catch {
    /* ignore */
  }
}

async function main() {
  if (await isBackendUp()) {
    log("Backend already available at http://localhost:8080");
    return;
  }
  log("Backend not reachable, attempting to start a local container...");

  // Pull preferred AR image
  let image = AR_IMAGE;
  let pulled = false;
  log(`Trying Artifact Registry image: ${image}`);
  let r = docker(["pull", image]);
  if (r.status === 0) {
    pulled = true;
  } else {
    // Fallback to Docker Hub
    image = HUB_IMAGE;
    log(`Falling back to Docker Hub image: ${image}`);
    r = docker(["pull", image]);
    pulled = r.status === 0;
  }

  if (!pulled) {
    log("Could not pull backend image from AR nor Docker Hub. Abort.");
    process.exit(1);
  }

  // Stop any previous instance
  tryRemoveExisting(CONTAINER_NAME);

  // Run on 8080; allow overriding envs via local environment
  const runArgs = [
    "run",
    "--rm",
    "-d",
    "--name",
    CONTAINER_NAME,
    "-p",
    "8080:8080",
    image,
  ];
  log(`Starting container: docker ${runArgs.join(" ")}`);
  const rr = docker(runArgs);
  if (rr.status !== 0) {
    log("Failed to start the backend container.");
    process.exit(1);
  }

  // Wait briefly and check
  log("Waiting for service to become healthy...");
  const start = Date.now();
  const timeoutMs = 30_000;
  while (Date.now() - start < timeoutMs) {
    if (await isBackendUp()) {
      log("Backend is up at http://localhost:8080");
      return;
    }

    await new Promise((r2) => setTimeout(r2, 1500));
  }
  log(
      "Backend container did not become ready in time. It may require DB env vars.",
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
