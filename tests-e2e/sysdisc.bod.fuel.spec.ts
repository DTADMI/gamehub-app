import {expect, test} from "@playwright/test";

test.describe('Systems Discovery — BOD Fuel', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('Core → WRAP → Fuel Intro → BF1→BF3 → Wrap', async ({page}) => {
        await page.goto('/games/systems-discovery');
        // B1 ordered steps
        await page.getByRole('button', {name: /Kitchen scraps/i}).click();
        await page.getByRole('button', {name: /Compost bin/i}).click();
        await page.getByRole('button', {name: /Soil mix/i}).click();
        await page.getByRole('button', {name: /Herb planter/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();
        // B2 choose bus-first
        await page.getByRole('button', {name: /Bus then Bike/i}).click();
        // B3 sorting
        await page.getByRole('button', {name: /Banana peel/i}).click();
        await page.getByRole('button', {name: /Plastic bottle/i}).click();
        await page.getByRole('button', {name: /Paper scrap/i}).click();
        await page.getByRole('button', {name: /Finish sorting/i}).click();

        // Enter Fuel sub-pack
        await page.getByRole('button', {name: /Try Body Systems \(Fuel\)/i}).click();
        await page.getByRole('button', {name: /Begin|Skip intro/i}).click();
        // BF1 → BF2 → BF3, simple continue path
        await page.getByRole('button', {name: /Continue/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();
        await page.getByRole('button', {name: /Reveal/i}).click();

        // Wrap shows badges
        await expect(page.getByText(/Care Ally badge/i)).toBeVisible();
        await expect(page.getByText(/Fuel badge/i)).toBeVisible();
    });
});
