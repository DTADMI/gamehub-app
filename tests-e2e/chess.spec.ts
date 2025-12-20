import {expect, test} from "@playwright/test";

test.describe("Chess MVP", () => {
    test("board renders and overlay dismisses", async ({page}) => {
        await page.goto("/games/chess");
        await page.waitForLoadState("domcontentloaded");
        await expect(page.getByRole("heading", {name: "Chess"})).toBeVisible();

        const start = page.getByRole("button", {
            name: /Tap to start|Tap to resume/i,
        });
        if (await start.isVisible()) {
            await start.click();
        }

        const canvas = page.locator('canvas[aria-label="Chess board"]');
        await expect(canvas).toBeVisible();
    });
});
