import {expect, test} from "@playwright/test";

test.describe("Snake mobile controllers", () => {
    test("selector toggles between Swipe / Joystick / Taps and persists", async ({
                                                                                     page,
                                                                                     context,
                                                                                 }) => {
        await page.goto("/games/snake");

        // Wait for canvas and controls
        const canvas = page.locator('canvas[aria-label="Snake playfield"]');
        await expect(canvas).toBeVisible({timeout: 20000});

        const swipeBtn = page.getByRole("button", {name: "Swipe"});
        const joystickBtn = page.getByRole("button", {name: "Joystick"});
        const tapsBtn = page.getByRole("button", {name: "Taps"});
        await expect(swipeBtn).toBeVisible();
        await expect(joystickBtn).toBeVisible();
        await expect(tapsBtn).toBeVisible();

        // Switch to Joystick
        await joystickBtn.click();
        await expect(async () => {
            const scheme = await page.evaluate(() =>
                localStorage.getItem("snakeControlScheme"),
            );
            expect(scheme).toBe("joystick");
        }).toPass();

        // Switch to Taps
        await tapsBtn.click();
        await expect(async () => {
            const scheme = await page.evaluate(() =>
                localStorage.getItem("snakeControlScheme"),
            );
            expect(scheme).toBe("taps");
        }).toPass();

        // Switch back to Swipe
        await swipeBtn.click();
        await expect(async () => {
            const scheme = await page.evaluate(() =>
                localStorage.getItem("snakeControlScheme"),
            );
            expect(scheme).toBe("swipe");
        }).toPass();

        // Start the game via overlay
        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        // Basic sanity: interact without throwing
        const box = await canvas.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
            await page.mouse.down();
            await page.mouse.up();
        }
    });
});
