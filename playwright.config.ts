import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  timeout: 30_000,
  // Give cold compiles a little more time before failing visibility checks
  expect: {timeout: 10_000},
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list", "html"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    navigationTimeout: 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  webServer: {
    // Use pnpm directly for consistency with local and CI environments
    command: "pnpm dev",
    url: process.env.E2E_BASE_URL || "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      // Disable external providers (Auth/GraphQL) during E2E so public pages are stable
      NEXT_PUBLIC_DISABLE_PROVIDERS: "true",
      PORT: "3000",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"]},
    },
    {
      name: "mobile-chrome",
      use: {...devices["Pixel 5"]},
    },
    {
      name: "mobile-safari",
      use: {...devices["iPhone 12"]},
    },
  ],
});
