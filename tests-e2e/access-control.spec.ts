import { expect, test } from "@playwright/test";

test.describe("Access control via middleware", () => {
  test("home (/) is public and does not redirect", async ({ page }) => {
    await page.goto("/");
    // Should remain on home, not /login
    await expect(page).not.toHaveURL(/\/login/);
    // Brand text present in navbar
    await expect(page.locator("header:has-text('GameHub')")).toBeVisible();
  });

  test("/projects is public and renders", async ({ page }) => {
    await page.goto("/projects");
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    // Projects heading from the page
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

  test("non-public route redirects to /login with redirect param", async ({ page }) => {
    const gatedPath = "/dashboard";
    await page.goto(gatedPath);
    await expect(page).toHaveURL(new RegExp(`/login.*[?&]redirect=${encodeURIComponent(gatedPath)}`));
  });
});
