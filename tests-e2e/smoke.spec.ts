import {expect, test} from "@playwright/test";

test.describe("home routes", () => {
  test("home page renders", async ({page}) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText(/GameHub/i);
  });
});

// Smoke each game route renders and Space does not scroll the page
const gameRoutes = [
  "/games/snake",
  "/games/breakout",
  "/games/tetris",
  "/games/block-blast",
  "/games/bubble-pop",
  "/games/memory",
  "/games/checkers",
  "/games/chess",
  "/games/platformer",
  "/games/tower-defense",
  "/games/knitzy",
];

for (const route of gameRoutes) {
  test(`game route ${route} renders and Space does not scroll`, async ({page}) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    // Try to wait for the focusable application region first (preferred)
    await page.waitForSelector('[role="application"]', {timeout: 10000}).catch(() => {
    });
    const appRegion = page.getByRole("application");

    if (await appRegion.count().then((c) => c > 0)) {
      await expect(appRegion.first()).toBeVisible({timeout: 10000});
      await appRegion.first().focus();
    } else {
      // Fallback to a canvas element for games that render on <canvas>
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible({timeout: 10000});
      await canvas.focus();
    }

    const before = await page.evaluate(() => document.scrollingElement?.scrollTop || 0);
    await page.keyboard.press("Space");
    const after = await page.evaluate(() => document.scrollingElement?.scrollTop || 0);
    expect(after).toBe(before);
  });
}
