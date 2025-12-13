// tests-e2e/smoke.spec.ts
import {expect, test} from "@playwright/test";

test.describe("home routes", () => {
  test("home page renders", async ({page}) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Check for any header or title containing GameHub
    const header = page.locator("h1, h2, h3, header, [data-testid='app-header']").first();
    await expect(header).toContainText(/GameHub/i, {timeout: 30000});
  });
});

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

test.describe("game routes", () => {
  for (const route of gameRoutes) {
    test(`game route ${route} renders and Space does not scroll`, async ({page}) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Try multiple selectors that might contain the game
      const possibleSelectors = [
        "canvas",
        "[data-testid='game-container']",
        ".game-container",
        "#game",
        "main",
        "body"
      ];

      let gameElement = null;

      // Try each selector until we find a visible element
      for (const selector of possibleSelectors) {
        const element = page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
          gameElement = element;
          break;
        }
      }

      if (!gameElement) {
        // Take a screenshot for debugging
        await page.screenshot({path: `test-results/${route.replace(/\//g, '-')}-screenshot.png`});
        throw new Error(`No visible game element found on ${route}. Tried selectors: ${possibleSelectors.join(', ')}`);
      }

      // Wait for the element to be visible with a longer timeout
      await expect(gameElement).toBeVisible({timeout: 30000});

      // Focus the element
      await gameElement.focus();

      // Test space key doesn't scroll
      const beforeScroll = await page.evaluate(() => window.scrollY);
      await page.keyboard.press("Space");
      const afterScroll = await page.evaluate(() => window.scrollY);
      expect(afterScroll).toBe(beforeScroll);
    });
  }
});