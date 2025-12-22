import {expect, test} from "@playwright/test";

test.describe("Rite of Discovery — smoke", () => {
    test("intro → C1 → wrap", async ({page}) => {
        await page.goto("/games/rite-of-discovery");
        await expect(page.getByRole("heading", {name: /Rite of Discovery/i})).toBeVisible();
        // Begin
        const begin = page.getByRole("button", {name: /Begin|Commencer/i});
        await begin.click();
        await expect(page.getByRole("heading", {name: /Chapter 1|Chapitre 1/i})).toBeVisible();
        // Choose an option
        const observe = page.getByRole("button", {name: /Observe|Observer/i});
        await observe.click();
        await expect(page.getByRole("heading", {name: /Wrap|Conclusion/i})).toBeVisible();
    });
});
