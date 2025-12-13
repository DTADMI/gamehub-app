// tests-e2e/access-control.spec.ts
import {expect, test} from "@playwright/test";

test.describe("Access control via middleware", () => {
  test("home (/) is public and does not redirect", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    // Wait for navigation and content to be ready
    await page.waitForLoadState("networkidle");
    // Check for any header that might contain GameHub
    await expect(page.locator("h1, h2, h3, header, [data-testid='app-header']").first()).toContainText(/GameHub/i, {timeout: 15000});
  });

  test("/projects is public and renders", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL("/projects");
    await page.waitForLoadState("networkidle");
    // Look for any heading that might contain "Projects"
    await expect(page.locator("h1, h2, h3, [data-testid='projects-heading']").first()).toContainText(/projects/i, {
      timeout: 15000,
      ignoreCase: true
    });
  });

  test("non-public route redirects to /login with redirect param", async ({page}) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirect/);
  });
});