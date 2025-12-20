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
import net from "node:net";

const env = process.env;
const PROJECT = env.GCP_PROJECT_ID || "games-portal-479600";
const REGION = env.GCP_REGION || "northamerica-northeast1";
const AR_REPO = env.AR_REPO || "gamehub";
const SERVICE = env.BACKEND_SERVICE || "gamehub-api";
const HUB_USER = env.DOCKERHUB_USERNAME || "darryltadmi";
const CONTAINER_NAME = "gamehub-backend-latest";
const COMPOSE_BACKEND_NAME = "gamehub-backend";

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

function dockerCapture(args, opts = {}) {
  // Returns stdout as string, exit status in .status
  return spawnSync("docker", args, {
    stdio: ["ignore", "pipe", "inherit"],
    ...opts,
  });
}

function tryRemoveExisting(name) {
  try {
    execSync(`docker rm -f ${name}`, {stdio: "ignore"});
  } catch {
    /* ignore */
  }
}

function checkTcp(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const onDone = (ok) => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(ok);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.once("error", () => onDone(false));
    socket.once("timeout", () => onDone(false));
    socket.connect(port, host, () => onDone(true));
  });
}

async function ensureLocalDbIfRequestedOrMissing() {
  log("Checking DB status");
  const useComposeDb =
      (process.env.USE_COMPOSE_DB || "true").toLowerCase() === "true";
  if (!useComposeDb) return {usedCompose: false};

  log("Ensuring compose Postgres (service 'db') is up...");
  const r = spawnSync("docker", ["compose", "up", "-d", "db"], {
    stdio: "inherit",
  });
  if (r.status !== 0) {
    log("Failed to start compose db service.");
    return {usedCompose: true, reachable: false};
  }

  // Wait up to ~60s for DB
  const start = Date.now();
  const dbTimeout = 60_000;
  while (Date.now() - start < dbTimeout) {
    if (await checkTcp("127.0.0.1", 5432, 1000)) {
      log("Postgres is accepting connections on localhost:5432");
      return {usedCompose: true, reachable: true};
    }
    await new Promise((r2) => setTimeout(r2, 1000));
  }
  log("Postgres did not become ready in time on localhost:5432");
  return {usedCompose: true, reachable: false};
}

async function main() {
  if (await isBackendUp()) {
    log("Backend already available at http://localhost:8080");
    return;
  }
  log("Backend not reachable, attempting to start a local container...");
  log("Checking DB status");
  // Optionally auto-start local Postgres via docker compose
  const dbStatus = await ensureLocalDbIfRequestedOrMissing();

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

  // Stop any previous instance(s)
  tryRemoveExisting(CONTAINER_NAME);
  tryRemoveExisting(COMPOSE_BACKEND_NAME);

  // Run on 8080; allow overriding envs via local environment
  // Build environment variables (with sensible defaults) for the backend container
  // Prefer Spring Boot standard envs; allow DB_* aliases to compose SPRING_DATASOURCE_URL
  const useComposeDb = (env.USE_COMPOSE_DB || "true").toLowerCase() === "true";

  // If we are using compose DB, prefer starting backend via docker compose so it can reach the `db` service by name.
  if (dbStatus.usedCompose && useComposeDb) {
    log(
        "Starting backend via docker compose (service 'backend') to reuse compose network...",
    );
    const composeEnv = {
      ...process.env,
      GCP_REGION: REGION,
      GCP_PROJECT_ID: PROJECT,
      AR_REPO,
      BACKEND_SERVICE: SERVICE,
    };
    const up = spawnSync("docker", ["compose", "up", "-d", "backend"], {
      stdio: "inherit",
      env: composeEnv,
    });
    if (up.status !== 0) {
      log(
          "docker compose up backend failed. Falling back to direct docker run path.",
      );
    } else {
      // Wait for health on localhost:8080
      log("Waiting for service to become healthy...");
      const start2 = Date.now();
      const timeout2 = Number(env.BACKEND_HEALTH_TIMEOUT_MS || 120_000);
      let firstHealthy2 = null;
      while (Date.now() - start2 < timeout2) {
        const apiOk = await check("http://localhost:8080/api/health");
        const actOk = await check("http://localhost:8080/actuator/health");
        if (!firstHealthy2) {
          if (apiOk) firstHealthy2 = "/api/health";
          else if (actOk) firstHealthy2 = "/actuator/health";
          if (firstHealthy2) log(`Health first responded at ${firstHealthy2}`);
        }
        if (apiOk || actOk) {
          log("Backend is up at http://localhost:8080");
          return;
        }
        await new Promise((r2) => setTimeout(r2, 1500));
      }
      log("Backend (compose) did not become ready in time. Showing logs:");
      try {
        spawnSync("docker", ["compose", "logs", "--tail", "200", "backend"], {
          stdio: "inherit",
          env: composeEnv,
        });
      } catch (error) {
        log(`Failed to show logs: ${error.message}`);
      }
      process.exit(1);
    }
  }
  // If we brought up compose db, prefer host.docker.internal with compose creds
  // Prefer explicit SPRING_DATASOURCE_URL if provided; otherwise, build from parts.
  // When compose DB is used, default to gamehub creds and host.docker.internal.
  const dbHost = dbStatus.usedCompose
      ? "host.docker.internal"
      : env.DB_HOST || "localhost";
  const dbPort = env.DB_PORT || "5432";
  const dbName = dbStatus.usedCompose ? "gamehub" : env.DB_NAME || "gamesdb";
  const dbUser =
      env.SPRING_DATASOURCE_USERNAME ||
      (dbStatus.usedCompose ? "gamehub" : env.DB_USER || "postgres");
  const dbPassword =
      env.SPRING_DATASOURCE_PASSWORD ||
      (dbStatus.usedCompose ? "gamehub" : env.DB_PASSWORD || "postgres");

  let springDatasourceUrl =
      env.SPRING_DATASOURCE_URL ||
      `jdbc:postgresql://${dbHost}:${dbPort}/${dbName}`;
  // Some backend images expect SPRING_DATASOURCE_* alias envs; provide them too for compatibility
  const legacyAliases = {
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_NAME: dbName,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
  };

  // Backend profile configurability
  const backendProfile =
      env.BACKEND_PROFILE || env.SPRING_PROFILES_ACTIVE || "local";

  const baseEnv = {
    // Spring profile and server port
    SPRING_PROFILES_ACTIVE: backendProfile,
    PORT: env.PORT || "8080",
    // Datasource
    SPRING_DATASOURCE_URL: springDatasourceUrl,
    SPRING_DATASOURCE_USERNAME: dbUser,
    SPRING_DATASOURCE_PASSWORD: dbPassword,
    // Auth / tokens (defaults match issue description)
    APP_JWT_SECRET: env.APP_JWT_SECRET || "change_me",
    APP_JWT_EXPIRATION_IN_MS: env.APP_JWT_EXPIRATION_IN_MS || "3600000",
    REFRESH_TOKEN_EXPIRATION_MS:
        env.REFRESH_TOKEN_EXPIRATION_MS || "2592000000",
    // CORS (allow common localhost origins)
    CORS_ALLOWED_ORIGINS:
        env.CORS_ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000",
  };
  // Also pass alias DB_* variables in case the image reads them
  Object.entries(legacyAliases).forEach(([k, v]) => (baseEnv[k] = v));

  // Optional pass-throughs (only if set in local env)
  const passthroughKeys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "FRONTEND_URL",
  ];
  // Include any NEXT_FIREBASE_* creds if present
  Object.keys(env)
      .filter((k) => k.startsWith("NEXT_FIREBASE_"))
      .forEach((k) => (baseEnv[k] = env[k]));
  passthroughKeys.forEach((k) => {
    if (env[k]) baseEnv[k] = env[k];
  });

  const envArgs = Object.entries(baseEnv).flatMap(([k, v]) => [
    "-e",
    `${k}=${v}`,
  ]);
  // Log effective datasource (mask password)
  try {
    const maskedUrl = baseEnv.SPRING_DATASOURCE_URL;
    const maskedUser = baseEnv.SPRING_DATASOURCE_USERNAME;
    log(`Effective datasource URL: ${maskedUrl}`);
    log(`Effective datasource user: ${maskedUser}`);
  } catch (error) {
    log(`Warning: Could not log datasource info: ${error.message}`);
  }

  // Linux-specific host mapping to make host.docker.internal work when using compose DB
  const addHostGateway =
      (dbStatus.usedCompose && process.platform === "linux") ||
      String(env.ADD_HOST_GATEWAY || "").toLowerCase() === "true";

  let runArgs = [
    "run",
    // Do NOT use --rm so we can get logs if it exits immediately
    "-d",
    "--name",
    CONTAINER_NAME,
    "-p",
    "8080:8080",
    ...(addHostGateway
        ? ["--add-host", "host.docker.internal:host-gateway"]
        : []),
    ...envArgs,
    image,
  ];
  log(`Starting container: docker ${runArgs.join(" ")}`);
  const rr = dockerCapture(runArgs);
  if (rr.status !== 0) {
    log("Failed to start the backend container.");
    process.exit(1);
  }
  const containerId = (rr.stdout || "").toString().trim();
  if (containerId) {
    log(`Container ID: ${containerId}`);
  }

  function isContainerRunning(nameOrId) {
    try {
      const res = execSync(`docker inspect -f {{.State.Running}} ${nameOrId}`, {
        stdio: ["ignore", "pipe", "ignore"],
      });
      return String(res.toString()).trim() === "true";
    } catch {
      return false;
    }
  }

  // Wait briefly and check
  log("Waiting for service to become healthy...");
  const start = Date.now();
  const timeoutMs = Number(env.BACKEND_HEALTH_TIMEOUT_MS || 120_000);
  let firstHealthy = null;
  let retriedLocalhost = false;
  while (Date.now() - start < timeoutMs) {
    // If container died, surface logs immediately
    if (!isContainerRunning(containerId || CONTAINER_NAME)) {
      log("Backend container exited prematurely. Showing logs:");
      try {
        // Try logs for the latest container with this name
        const latestId = (function () {
          try {
            const out = execSync(
                `docker ps -a -q --filter name=${CONTAINER_NAME} --no-trunc`,
                {stdio: ["ignore", "pipe", "ignore"]},
            );
            return (
                String(out.toString()).trim().split(/\r?\n/).filter(Boolean)[0] ||
                containerId
            );
          } catch {
            return containerId;
          }
        })();
        spawnSync(
            "docker",
            ["logs", "--tail", "200", latestId || containerId || CONTAINER_NAME],
            {stdio: "inherit"},
        );
      } catch (error) {
        log(`Failed to show container logs: ${error.message}`);
      }

      // If using compose DB and running on Windows/macOS, try one retry with localhost instead of host.docker.internal
      const isWin = process.platform === "win32";
      const isMac = process.platform === "darwin";
      if (!retriedLocalhost && dbStatus.usedCompose && (isWin || isMac)) {
        log(
            "Retrying once with SPRING_DATASOURCE_URL using localhost instead of host.docker.internal ...",
        );
        tryRemoveExisting(CONTAINER_NAME);
        const retryEnv = {
          ...baseEnv,
          SPRING_DATASOURCE_URL: `jdbc:postgresql://localhost:${dbPort}/${dbName}`,
          DB_HOST: "localhost",
        };
        const retryEnvArgs = Object.entries(retryEnv).flatMap(([k, v]) => [
          "-e",
          `${k}=${v}`,
        ]);
        runArgs = [
          "run",
          "-d",
          "--name",
          CONTAINER_NAME,
          "-p",
          "8080:8080",
          ...retryEnvArgs,
          image,
        ];
        log(`Starting retry container: docker ${runArgs.join(" ")}`);
        const rr2 = dockerCapture(runArgs);
        if (rr2.status !== 0) {
          log("Retry failed to start the backend container.");
          process.exit(1);
        }
        const cid2 = (rr2.stdout || "").toString().trim();
        if (cid2) log(`Retry Container ID: ${cid2}`);
        retriedLocalhost = true;
        // Continue outer loop which will now probe health on the retried container
        await new Promise((r2) => setTimeout(r2, 1000));
        continue;
      }
      process.exit(1);
    }
    // Probe both endpoints each cycle and record which becomes ready first
    const apiOk = await check("http://localhost:8080/api/health");
    const actOk = await check("http://localhost:8080/actuator/health");
    if (!firstHealthy) {
      if (apiOk) firstHealthy = "/api/health";
      else if (actOk) firstHealthy = "/actuator/health";
      if (firstHealthy) log(`Health first responded at ${firstHealthy}`);
    }
    if (apiOk || actOk) {
      log("Backend is up at http://localhost:8080");
      return;
    }

    await new Promise((r2) => setTimeout(r2, 1500));
  }
  log(
      "Backend container did not become ready in time. It may require DB env vars.",
  );
  // Tail logs for diagnostics
  try {
    log("Showing last 200 lines of backend container logs:");
    spawnSync(
        "docker",
        ["logs", "--tail", "200", containerId || CONTAINER_NAME],
        {stdio: "inherit"},
    );
  } catch (error) {
    log(`Failed to display container logs: ${error.message}`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
