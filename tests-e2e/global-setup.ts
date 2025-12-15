import type {FullConfig} from "@playwright/test";
import {spawnSync} from "node:child_process";

const DEFAULT_API = "http://localhost:8080/api";

async function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

async function isHealthy(baseUrl: string): Promise<boolean> {
    const tryUrls = [
        `${baseUrl}/api/health`,
        `${baseUrl}/actuator/health`,
        `${baseUrl}/health`,
    ];
    for (const url of tryUrls) {
        try {
            const r = await fetch(url, {method: "GET"});
            if (r.ok) return true;
        } catch {
        }
    }
    return false;
}

function maybeStartFallbackBackend(): void {
    // Run the existing helper script which prefers AR image and falls back to Docker Hub
    const result = spawnSync(
        process.execPath,
        ["./scripts/dev-backend-fallback.mjs", "--quiet"],
        {stdio: "inherit", env: process.env}
    );
    if (result.error) {
        // Best-effort only: do not throw; E2E can still run without backend
        // eslint-disable-next-line no-console
        console.warn("[E2E] Backend fallback start encountered an error:", result.error);
    }
}

export default async function globalSetup(_config: FullConfig) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API;
    const base = apiUrl.replace(/\/api$/, "");

    // Only attempt local fallback when targeting localhost/127.0.0.1 and public mode is not forced
    const isLocal = /^(http:\/\/)?(localhost|127\.0\.0\.1)(:|\b)/i.test(base);
    const publicMode = (process.env.E2E_PUBLIC_MODE || "false").toLowerCase() === "true";

    if (!isLocal || publicMode) {
        return;
    }

    // Quick pre-check
    if (await isHealthy(base)) {
        return;
    }

    // Start fallback backend
    maybeStartFallbackBackend();

    // Poll for health up to ~45s
    const deadline = Date.now() + 45_000;
    while (Date.now() < deadline) {
        if (await isHealthy(base)) {
            return;
        }
        await sleep(1500);
    }

    // eslint-disable-next-line no-console
    console.warn(
        `[E2E] Backend health not detected at ${base}. Continuing tests; backend-dependent tests may be skipped by app config.`,
    );
}
