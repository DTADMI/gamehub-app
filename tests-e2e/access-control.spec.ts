import {expect, test} from "@playwright/test";

test.describe("Access control via middleware", () => {
  test("home (/) is public and does not redirect", async ({ page }) => {
    await page.goto("/");
    // Should remain on home, not /login
    await expect(page).not.toHaveURL(/\/login/);
      // Smoke check: hero heading is visible on the home page
      await expect(
          page.getByRole("heading", {name: /JavaScript Games & Interactive Projects/i})
      ).toBeVisible({timeout: 10000});
  });

  test("/projects is public and renders", async ({ page }) => {
    await page.goto("/projects");
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
    // Projects heading from the page
      await expect(page.getByRole("heading", {name: "Projects"})).toBeVisible({timeout: 10000});
  });

    test("non-public route redirects to /login with redirect param", async ({
                                                                                page,
                                                                            }) => {
    const gatedPath = "/dashboard";
    await page.goto(gatedPath);
        await expect(page).toHaveURL(
            new RegExp(`/login.*[?&]redirect=${encodeURIComponent(gatedPath)}`),
        );
  });
});
