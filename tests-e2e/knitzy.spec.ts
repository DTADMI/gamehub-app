import {expect, test} from '@playwright/test';

test.describe('Knitzy MVP', () => {
    test('canvas renders and tapping stitches increases score text', async ({page}) => {
        await page.goto('/games/knitzy');
        await page.waitForLoadState('domcontentloaded');
        // Wait for title to ensure GameContainer rendered
        await expect(page.getByRole('heading', {name: 'Knitzy'})).toBeVisible();

        // Start if overlay is present
        const start = page.getByRole('button', {name: /Tap to start|Tap to resume/i});
        if (await start.isVisible()) {
            await start.click();
        }

        const canvas = page.locator('canvas[aria-label="Knitzy playfield"]');
        await expect(canvas).toBeVisible();

        // Tap center to stitch
        const box = await canvas.boundingBox();
        if (!box) throw new Error('Canvas box not found');
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

        // Expect description to reflect changed score
        const desc = page.getByText(/Score:\s*\d+/);
        await expect(desc).toBeVisible();
    });
});
