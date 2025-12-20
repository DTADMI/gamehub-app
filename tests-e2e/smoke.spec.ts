// tests-e2e/smoke.spec.ts
import {expect, test} from "@playwright/test";

test.describe("home routes", () => {
  test("home page renders", async ({page}) => {
    await page.goto("/");

    // Check for error first
    const error = page.locator('text="Application error"').first();
    if (await error.isVisible().catch(() => false)) {
      const errorText = await error.textContent();
      if (process.env.CI && errorText?.includes("client-side exception")) {
        throw new Error("Client-side error in home page: " + errorText);
      }
    }

    // More flexible header check
    await expect(
        page
            .locator(
                "h1, h2, h3, header, [data-testid='app-header'], .app-title, .site-title",
            )
            .first(),
    ).toContainText(/GameHub/i, {
      timeout: 30000,
      ignoreCase: true,
    });
  });
});
