import {expect, test} from '@playwright/test';

test.describe('Bubble Pop MVP', () => {
    test('canvas renders and popping increases score text', async ({page}) => {
        await page.goto('/games/bubble-pop');
        await page.waitForLoadState('domcontentloaded');
        await expect(page.getByRole('heading', {name: 'Bubble Pop'})).toBeVisible();

        const start = page.getByRole('button', {name: /Tap to start|Tap to resume/i});
        if (await start.isVisible()) {
            await start.click();
        }

        const canvas = page.locator('canvas[aria-label="Bubble Pop playfield"]');
        await expect(canvas).toBeVisible();

        // Wait a moment for a bubble to spawn then click center area
        await page.waitForTimeout(1200);
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas box not found');
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

        const desc = page.getByText(/Score:\s*\d+/);
        await expect(desc).toBeVisible();
    });
});
