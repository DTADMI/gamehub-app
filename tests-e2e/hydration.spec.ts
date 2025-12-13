// tests-e2e/hydration.spec.ts
import {expect, test} from "@playwright/test";

test("no hydration mismatch errors on home", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");
  // Wait for the page to be fully loaded
  await page.waitForLoadState("networkidle");

  // Check for any visible content to ensure the page is loaded
  const body = page.locator("body");
  await expect(body).toBeVisible({timeout: 30000});

  // Check for hydration errors
  const hydrationErrors = errors.filter(error =>
      /hydration|didn't match|content mismatch|mismatch during hydration|hydration failed|react-dom.development.js/i.test(error)
  );

  if (hydrationErrors.length > 0) {
    console.error("Hydration errors found:", hydrationErrors);
    // Take a screenshot for debugging
    await page.screenshot({path: "test-results/hydration-error.png"});
  }

  expect(hydrationErrors).toHaveLength(0);
});