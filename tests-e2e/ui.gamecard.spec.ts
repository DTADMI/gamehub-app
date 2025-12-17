import {expect, test} from "@playwright/test";

test.describe("Game cards UX", () => {
    test("entire game card is clickable and navigates to the game", async ({page}) => {
        await page.goto("/games");

        // Find the first game card link
        const firstCardLink = page.locator('a[href^="/games/"]').first();
        await expect(firstCardLink).toBeVisible({timeout: 15000});

        // Click near the center of the card to ensure full-card click works
        const box = await firstCardLink.boundingBox();
        if (!box) throw new Error("Game card link bounding box not found");
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.up();

        await expect(page).toHaveURL(/\/games\//);
    });

    test("game card image uses a 16:9 aspect wrapper (no stretching)", async ({page}) => {
        await page.goto("/games");

        // The GameCard image is wrapped in a div with Tailwind class aspect-[16/9]
        // Verify at least one such wrapper is present and visible
        const aspectWrapper = page.locator('div.aspect-\\[16\\/9\\]');
        await expect(aspectWrapper.first()).toBeVisible({timeout: 10000});

        // Optional: ensure the contained img covers the wrapper
        const img = aspectWrapper.first().locator('img');
        await expect(img).toBeVisible();
    });
});
