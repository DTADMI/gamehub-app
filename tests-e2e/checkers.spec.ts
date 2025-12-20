import {expect, test} from "@playwright/test";

test.describe("Checkers MVP", () => {
    test("board renders and start overlay dismisses", async ({page}) => {
        await page.goto("/games/checkers");
        await page.waitForLoadState("domcontentloaded");
        await expect(page.getByRole("heading", {name: "Checkers"})).toBeVisible();

        const start = page.getByRole("button", {
            name: /Tap to start|Tap to resume/i,
        });
        if (await start.isVisible()) {
            await start.click();
        }

        const board = page.locator('[data-testid="checkers-board"]');
        await expect(board).toBeVisible();
    });
});
