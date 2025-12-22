import {expect, test} from "@playwright/test";

test.describe("Toymaker Escape — smoke", () => {
    test("intro → E1 → wrap", async ({page}) => {
        await page.goto("/games/toymaker-escape");
        await expect(page.getByRole("heading", {name: /Toymaker Escape|Intro/i})).toBeVisible();
        // Begin
        const begin = page.getByRole("button", {name: /Begin|Commencer/i});
        await begin.click();
        await expect(page.getByRole("heading", {name: /Episode 1|Épisode 1/i})).toBeVisible();
        // Solve placeholder
        const solve = page.getByRole("button", {name: /Turn gears|Tourner les engrenages/i});
        await solve.click();
        await expect(page.getByRole("heading", {name: /Wrap|Conclusion/i})).toBeVisible();
    });
});
