import {expect, test} from "@playwright/test";

test.describe("Memory UI interactions", () => {
    test("matched cards become invisible but preserve layout space", async ({page}) => {
        await page.goto("/games/memory");

        // Start the game if overlay is present
        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        // Click two different cards until a match is found; limit attempts to avoid long runs
        const cards = page.locator('[data-testid="memory-card"], div[style*="transform-style"]');
        await expect(cards.first()).toBeVisible();

        // Try sequential pairs (0,1), (2,3), ... until a matched pair becomes invisible
        let found = false;
        for (let i = 0; i < 18 && !found; i += 2) {
            const c1 = cards.nth(i);
            const c2 = cards.nth(i + 1);
            if (!(await c1.isVisible()) || !(await c2.isVisible())) continue;
            await c1.click();
            await c2.click();
            // Wait briefly to allow flip + potential match animation
            await page.waitForTimeout(700);
            // If both are now non-interactive with opacity 0, we consider it matched/hidden
            const style1 = await c1.getAttribute('style');
            const style2 = await c2.getAttribute('style');
            const box1 = await c1.boundingBox();
            const box2 = await c2.boundingBox();
            if (box1 && box2 && box1.width > 0 && box1.height > 0 && box2.width > 0 && box2.height > 0) {
                // Ensure they still occupy layout (non-zero bounding boxes)
                // and rely on class to indicate opacity-0 pointer-events-none
                const class1 = await c1.getAttribute('class');
                const class2 = await c2.getAttribute('class');
                if ((class1 || '').includes('opacity-0') && (class2 || '').includes('opacity-0')) {
                    found = true;
                    break;
                }
            }
        }

        expect(found).toBeTruthy();
    });
});
