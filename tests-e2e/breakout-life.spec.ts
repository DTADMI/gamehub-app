import {expect, test} from "@playwright/test";

test.describe("Breakout life loss and resume", () => {
    test("losing a life decrements and a second start resumes movement", async ({page}) => {
        await page.goto("/games/breakout");

        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible({timeout: 15000});

        // Start the game (tap overlay if present)
        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        } else {
            await page.keyboard.press(' ');
        }

        // Wait for ball y to start changing
      await page.waitForTimeout(100);
        const y1 = await canvas.getAttribute("data-bally");
        await page.waitForTimeout(250);
        const y2 = await canvas.getAttribute("data-bally");
        expect(y1).not.toBeNull();
        expect(y2).not.toBeNull();
        expect(Number(y1)).not.toEqual(Number(y2));

        // Wait until a life is lost (lives attr decreases)
        const initialLivesAttr = await canvas.getAttribute("data-lives");
        const initialLives = Number(initialLivesAttr ?? "3") || 3;
        await expect.poll(async () => {
            const val = Number((await canvas.getAttribute("data-lives")) ?? "0");
            return val;
        }, {timeout: 15000}).toBeLessThan(initialLives);

        // After life loss, gameStarted becomes false; tap overlay or toggle to resume
        const overlay2 = page.locator('button:has-text("Tap to start")');
        if (await overlay2.isVisible()) {
            await overlay2.click();
        } else {
            const pauseBtn = page.locator('[data-testid="btn-pause"]');
            if (await pauseBtn.isVisible()) {
                await pauseBtn.click();
            } else {
                await page.keyboard.press(' ');
            }
        }
      await page.waitForTimeout(100);
        const yBefore = await canvas.getAttribute("data-bally");
        await page.waitForTimeout(250);
        const yAfter = await canvas.getAttribute("data-bally");
        expect(Number(yBefore)).not.toEqual(Number(yAfter));
    });
});
