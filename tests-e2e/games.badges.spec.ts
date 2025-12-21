import {expect, test} from "@playwright/test";

test.describe("Games page badges", () => {
    test("shows Featured (green) and Upcoming (yellow) badges appropriately", async ({page}) => {
        await page.goto("/games");
        await page.waitForLoadState("domcontentloaded");

        // There should be at least one Featured badge (all playable games)
        const featuredBadges = page.locator("text=Featured");
        await expect(featuredBadges.first()).toBeVisible();

        // Upcoming badge should exist when there are upcoming entries (we added knitzy upcoming)
        const upcomingBadges = page.locator("text=Upcoming");
        await expect(upcomingBadges.first()).toBeVisible();
    });
});
