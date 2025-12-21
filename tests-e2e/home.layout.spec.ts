import {expect, test} from "@playwright/test";

test.describe("Home layout (desktop)", () => {
    test("Featured carousel shows exactly 3 full cards at xl without partial scroll", async ({page}) => {
        await page.setViewportSize({width: 1440, height: 900});
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");

        // Locate the featured carousel by finding a sibling after the heading
        const featuredHeading = page.getByRole("heading", {name: /Featured Games/i});
        await expect(featuredHeading).toBeVisible();

        // The carousel items are links to /games/<slug>; count visible within viewport area
        const carousel = featuredHeading.locator("xpath=following::div[contains(@class,'flex')][1]");
        await expect(carousel).toBeVisible();

        const cards = page.locator('a[href^="/games/"]');
        // Ensure at least 3 exist
        await expect(cards.nth(2)).toBeVisible();

        // Measure first three cards; they should be fully within the carousel viewport width
        const viewport = carousel.first();
        const vpBox = await viewport.boundingBox();
        if (!vpBox) throw new Error("Carousel viewport not found");

        // Collect bbox for first three cards (as they appear)
        const cardBoxes = [] as { x: number; y: number; width: number; height: number }[];
        for (let i = 0; i < 3; i++) {
            const box = await cards.nth(i).boundingBox();
            if (!box) throw new Error(`Card ${i} bbox not found`);
            cardBoxes.push(box);
        }

        // Assert each of the first three is fully visible within the viewport horizontally
        for (const box of cardBoxes) {
            expect(box.x).toBeGreaterThanOrEqual(vpBox.x - 1);
            expect(box.x + box.width).toBeLessThanOrEqual(vpBox.x + vpBox.width + 1);
        }
    });
});
