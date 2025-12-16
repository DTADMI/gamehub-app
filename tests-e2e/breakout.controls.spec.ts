import {expect, test} from '@playwright/test';

test.describe('Breakout — pause immobility and boosters', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/games/breakout');
    });

    test('paddle does not move while paused and moves when resumed', async ({page}) => {
        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible();

        // Start the game (tap overlay if present)
        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        // Ensure data attributes exist
        await expect(canvas).toHaveAttribute('data-px', /\d+/);

        // Pause with Space
        await page.keyboard.press('Space');
        const pxBefore = await canvas.getAttribute('data-px');

        // Move mouse across the canvas while paused
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas bounding box not found');
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);

        const pxAfterPaused = await canvas.getAttribute('data-px');
        expect(pxAfterPaused).toBe(pxBefore);

        // Resume with Space
        await page.keyboard.press('Space');
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
        const pxAfterMove = await canvas.getAttribute('data-px');
        expect(pxAfterMove).not.toBe(pxBefore);
    });

    test('clicking Boost decreases boosters counter in HUD', async ({page}) => {
        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible();

        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        const boostsHud = page.locator('div:has-text("Boosts")');
        await expect(boostsHud).toBeVisible();
        const textBefore = await boostsHud.textContent();
        if (!textBefore) throw new Error('Boosts HUD not found');
        const m = textBefore.match(/🚀\s*x(\d+)/);
        expect(m).not.toBeNull();
        const before = Number(m![1]);

        const boostBtn = page.locator('button:has-text("Boost")');
        await expect(boostBtn).toBeEnabled();
        await boostBtn.click();

        await expect(async () => {
            const textAfter = await boostsHud.textContent();
            if (!textAfter) throw new Error('Boosts HUD not found');
            const m2 = textAfter.match(/🚀\s*x(\d+)/);
            expect(m2).not.toBeNull();
            const after = Number(m2![1]);
            expect(after).toBe(before - 1);
        }).toPass();
    });
});
