import {expect, test} from "@playwright/test";

test.describe("Particles controls gating (only Breakout)", () => {
    test("Particles controls are NOT shown on Memory and Snake", async ({page}) => {
        // Memory
        await page.goto("/games/memory");
        const app1 = page.getByRole("application");
        await expect(app1).toBeVisible();
        await expect(page.getByLabel("Particles")).toHaveCount(0);

        // Snake
        await page.goto("/games/snake");
        const app2 = page.getByRole("application");
        await expect(app2).toBeVisible();
        await expect(page.getByLabel("Particles")).toHaveCount(0);
    });
});
