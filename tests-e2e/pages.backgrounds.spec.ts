import {expect, test} from "@playwright/test";

test.describe("Background visibility (light/dark)", () => {
    test("/games shows scenic background in light and dark", async ({page}) => {
        await page.goto("/games");
        await page.waitForLoadState("domcontentloaded");

        const bgLight = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgLight).toMatch(/gradient/);

        await page.evaluate(() => document.documentElement.classList.add('dark'));
        const bgDark = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgDark).toMatch(/gradient/);
    });

    test("/signin shows scenic background around the card in light and dark", async ({page}) => {
        await page.goto("/signin");
        await page.waitForLoadState("domcontentloaded");

        const bgLight = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgLight).toMatch(/gradient/);

        await page.evaluate(() => document.documentElement.classList.add('dark'));
        const bgDark = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundImage);
        expect(bgDark).toMatch(/gradient/);
    });
});
