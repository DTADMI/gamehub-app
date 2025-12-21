import {expect, test} from "@playwright/test";

test.describe("Snake MVP", () => {
    test("canvas renders and HUD visible after basic input", async ({page}) => {
        await page.goto("/games/snake");
        await page.waitForLoadState("domcontentloaded");
        await expect(page.getByRole("heading", {name: /Snake/i})).toBeVisible();

        const start = page.getByRole("button", {name: /Tap to start|Tap to resume/i});
        if (await start.isVisible().catch(() => false)) {
            await start.click();
        }

        const canvas = page.locator('[data-testid="snake-canvas"]');
        await expect(canvas).toBeVisible();

        // Focus and send some moves
        await canvas.click();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowLeft");

        // Assert Score label is present (value may still be 0)
        await expect(page.getByText(/Score:\s*\d+/)).toBeVisible();

    });
});
