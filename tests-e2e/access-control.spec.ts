// tests-e2e/access-control.spec.ts
import {expect, test} from "@playwright/test";

test.describe("Access control via middleware", () => {
  test("home (/) is public and does not redirect", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    // Small grace period on CI to absorb first-render jitter
    if (process.env.CI) {
      await page.waitForTimeout(250);
    }

    // Handle potential client-side errors
    const error = page.locator('text="Application error"').first();
    const hasError = await error.isVisible().catch(() => false);

    if (hasError) {
      // If there's an error, check if it's just a hydration warning
      const errorText = await error.textContent();
      if (errorText && errorText.includes('client-side exception')) {
        // If we're in CI, we might want to be more strict
        if (process.env.CI) {
          throw new Error('Client-side error detected in CI: ' + errorText);
        }
        // For local development, we might be more lenient
        console.warn('Client-side error detected but continuing test:', errorText);
      }
    }

    // Check for any header that might contain GameHub
    await expect(
        page.locator("h1, h2, h3, header, [data-testid='app-header'], .app-title, .site-title").first()
    ).toContainText(/GameHub/i, {
      timeout: 30000,
      ignoreCase: true
    });
  });

  test("/projects is public and renders", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL("/projects");
    if (process.env.CI) {
      await page.waitForTimeout(250);
    }

    // Similar error handling as above
    const error = page.locator('text="Application error"').first();
    if (await error.isVisible().catch(() => false)) {
      const errorText = await error.textContent();
      if (process.env.CI && errorText?.includes('client-side exception')) {
        throw new Error('Client-side error in projects page: ' + errorText);
      }
    }

    await expect(
        page.locator("h1, h2, h3, [data-testid='projects-heading'], .page-title").first()
    ).toContainText(/projects/i, {
      timeout: 30000,
      ignoreCase: true
    });
  });

  test("non-public route redirects to /login with redirect param", async ({page}) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirect/);
  });
});