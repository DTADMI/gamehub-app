import {expect, test} from "@playwright/test";

test.describe("Systems Discovery — BOD Breath scaffold", () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test("Core → WRAP → Breath intro → BB1→BB3 → Wrap", async ({page}) => {
        await page.goto("/games/systems-discovery");

        // Complete Core quickly (same as existing core smoke)
        await page.getByRole('button', {name: /Kitchen scraps/i}).click();
        await page.getByRole('button', {name: /Compost bin/i}).click();
        await page.getByRole('button', {name: /Soil mix/i}).click();
        await page.getByRole('button', {name: /Herb planter/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();
        await page.getByRole('button', {name: /Bus then Bike/i}).click();
        await page.getByRole('button', {name: /Banana peel/i}).click();
        await page.getByRole('button', {name: /Plastic bottle/i}).click();
        await page.getByRole('button', {name: /Paper scrap/i}).click();
        await page.getByRole('button', {name: /Finish sorting/i}).click();

        // WRAP → temporary link into BOD Breath
        await page.getByRole('button', {name: /Try Body Systems \(Breath\)/i}).click();

        // Breath Intro → BB1
        await page.getByRole('button', {name: /Begin|Skip intro/i}).first().click();
        // BB1 → Continue
        await expect(page.getByRole('heading', {name: /BB1/i})).toBeVisible();
        await page.getByRole('button', {name: /Continue|sysdisc\.bod\.common\.continue/}).click();
        // BB2 → Continue
        await expect(page.getByRole('heading', {name: /BB2/i})).toBeVisible();
        await page.getByRole('button', {name: /Continue|sysdisc\.bod\.common\.continue/}).click();
        // BB3 → Reveal
        await expect(page.getByRole('heading', {name: /BB3/i})).toBeVisible();
        await page.getByRole('button', {name: /Reveal|sysdisc\.bod\.common\.reveal/}).click();

        // Wrap shows badges lines
        await expect(page.getByRole('heading', {name: /Wrap — Breath/i})).toBeVisible();
        await expect(page.getByText(/Care Ally badge/)).toBeVisible();
    });
});
