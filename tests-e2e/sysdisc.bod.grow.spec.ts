import {expect, test} from "@playwright/test";

test.describe('Systems Discovery — BOD Grow', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('Core → WRAP → Grow Intro → BG1→BG3 → Wrap', async ({page}) => {
        await page.goto('/games/systems-discovery');
        // Core quick path
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

        // Grow sub-pack
        await page.getByRole('button', {name: /Try Body Systems \(Grow\)/i}).click();
        await page.getByRole('button', {name: /Begin|Skip intro/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();
        await page.getByRole('button', {name: /Reveal/i}).click();

        await expect(page.getByText(/Care Ally badge/i)).toBeVisible();
        await expect(page.getByText(/Grow badge/i)).toBeVisible();
    });
});
