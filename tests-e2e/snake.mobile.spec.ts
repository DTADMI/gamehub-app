import {devices, expect, test} from "@playwright/test";

test.use(devices["Pixel 5"]);

test.describe("Snake — mobile swipe controls", () => {
    test("swipe changes direction and page does not scroll", async ({page}) => {
        await page.goto("/games/snake");

        // Canvas should be visible
        const canvas = page.locator('[aria-label="Snake playfield"]');
        await expect(canvas).toBeVisible();

        // Remember initial scroll
        const scrollBefore = await page.evaluate(() => ({x: window.scrollX, y: window.scrollY}));

        // Perform a swipe gesture across the canvas area
        const box = await canvas.boundingBox();
        if (!box) throw new Error("Canvas bounding box not found");
        const startX = box.x + box.width * 0.25;
        const startY = box.y + box.height * 0.5;
        const endX = box.x + box.width * 0.75;
        const endY = startY;
        // Ensure game starts (tap overlay if present)
        const tapToStart = page.getByRole("button", {name: /Tap to start/i});
        if (await tapToStart.isVisible().catch(() => false)) {
            await tapToStart.click();
        }

        await page.touchscreen.tap(startX, startY);
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchstart', {
            touches: [{
                clientX: startX,
                clientY: startY
            }]
        } as any);
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchmove', {
            touches: [{
                clientX: endX,
                clientY: endY
            }]
        } as any);
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchend', {} as any);

        // Verify scroll didn’t change
        const scrollAfter = await page.evaluate(() => ({x: window.scrollX, y: window.scrollY}));
        expect(scrollAfter.x).toBe(scrollBefore.x);
        expect(scrollAfter.y).toBe(scrollBefore.y);

        // Minimal gameplay assertion: score text present
        await expect(page.getByText(/Score:/i)).toBeVisible();
    });
});

// Run the same smoke on iPhone 12 profile to ensure parity across engines
test.describe.configure({mode: "serial"});
test.describe("Snake — mobile swipe on iPhone 12", () => {
    test.use(devices["iPhone 12"]);
    test("swipe and no-scroll", async ({page}) => {
        await page.goto("/games/snake");
        const canvas = page.locator('[aria-label="Snake playfield"]');
        await expect(canvas).toBeVisible();
        const tapToStart = page.getByRole("button", {name: /Tap to start/i});
        if (await tapToStart.isVisible().catch(() => false)) {
            await tapToStart.click();
        }
        const box = await canvas.boundingBox();
        if (!box) throw new Error("Canvas bounding box not found");
        const startX = box.x + box.width * 0.25;
        const startY = box.y + box.height * 0.5;
        const endX = box.x + box.width * 0.75;
        const endY = startY;
        const scrollBefore = await page.evaluate(() => ({x: window.scrollX, y: window.scrollY}));
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchstart', {
            touches: [{
                clientX: startX,
                clientY: startY
            }]
        } as any);
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchmove', {
            touches: [{
                clientX: endX,
                clientY: endY
            }]
        } as any);
        await page.dispatchEvent('[aria-label="Snake playfield"]', 'touchend', {} as any);
        const scrollAfter = await page.evaluate(() => ({x: window.scrollX, y: window.scrollY}));
        expect(scrollAfter.x).toBe(scrollBefore.x);
        expect(scrollAfter.y).toBe(scrollBefore.y);
        await expect(page.getByText(/Score:/i)).toBeVisible();
    });
});
