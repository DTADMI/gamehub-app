import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Gamehub|ProjectHub/i);
  await expect(page.locator("header:has-text('Gamehub')")).toBeVisible();
});

test("home hero CTAs visible and accessible", async ({ page }) => {
  await page.goto("/");
  // Play Now CTA scrolls to featured games
  const playNow = page.getByRole("link", { name: /Play Now/i });
  await expect(playNow).toBeVisible();
  // How It Works CTA scrolls to section
  const howItWorks = page.getByRole("link", { name: /How It Works/i });
  await expect(howItWorks).toBeVisible();
});

test("first featured image is eager/priority to avoid LCP warning", async ({ page }) => {
  await page.goto("/#featured-games");
  const firstFeatured = page.locator("#featured-games img").first();
  await expect(firstFeatured).toBeVisible();
  // Next/Image renders a native <img> with loading attribute on the client
  const loading = await firstFeatured.getAttribute("loading");
  expect(loading).toBe("eager");
});

test("auth route available", async ({ page }) => {
  await page.goto("/api/auth/signin");
  // NextAuth may render a default sign-in page if enabled
  await expect(page.locator("body")).toBeVisible();
});
