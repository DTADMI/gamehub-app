import {expect, test} from "@playwright/test";

test.describe("Breakout HUD stability", () => {
    test("HUD does not shift canvas when power-up appears", async ({page}) => {
        await page.goto("/games/breakout");
        // Wait for app shell
        const appShell = page.getByRole('application', {name: 'Breakout game'});
        await expect(appShell).toBeVisible({timeout: 20000});
        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible({timeout: 30000});

        // Start game: dismiss overlay if present
        const overlay = page.locator('button[aria-label="Tap to start"]');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        // Record initial canvas top position relative to viewport
        const box0 = await canvas.boundingBox();
        if (!box0) throw new Error('Canvas not found');

        // Wait briefly to allow a power-up to spawn/be collected. If none, simulate some time.
        await page.waitForTimeout(2000);

        // Re-measure canvas top; it should not have moved more than a pixel due to HUD layout
        const box1 = await canvas.boundingBox();
        if (!box1) throw new Error('Canvas not found after wait');
        const deltaY = Math.abs((box1.y ?? 0) - (box0.y ?? 0));
        expect(deltaY).toBeLessThanOrEqual(1);
    });
});
