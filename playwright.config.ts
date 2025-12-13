import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  timeout: 30_000,
    // Give cold compiles a little more time before failing visibility checks
    expect: {timeout: 10_000},
  fullyParallel: true,
  reporter: [["list"]],
  use: {
      baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
    webServer: {
        // Use pnpm directly for consistency with local and CI environments
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
        env: {
            NEXT_PUBLIC_API_URL:
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
            PORT: "3000",
        },
    },
    projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
});
