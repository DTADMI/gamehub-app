import {expect, test} from "@playwright/test";

test("no hydration mismatch errors on home", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");

  // Wait for the page to be fully loaded and interactive
  await page.waitForLoadState("networkidle");

  // Check for hydration errors
  const hydrationErrors = errors.filter(
      (error) =>
          error.includes("Hydration") ||
          error.includes("hydration") ||
          error.includes("Text content did not match"),
  );

  // Basic visible smoke to ensure page rendered
  // Prefer the hero heading, fall back to the Featured Games section if present
  const hero = page.getByRole("heading", {name: /JavaScript Games & Interactive Projects/i});
  if (await hero.count().then((c) => c > 0)) {
    await expect(hero.first()).toBeVisible({timeout: 10000});
  } else {
    await expect(page.getByRole("heading", {name: /Featured Games/i})).toBeVisible({timeout: 10000});
  }

  // Check for any hydration errors
  expect(hydrationErrors).toHaveLength(0);
});
