import {expect, test} from "@playwright/test";

test.describe('Systems Discovery — BOD Grow', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('Grow pack via deep-link: Intro → BG1→BG3 → Wrap; meter steady', async ({page}) => {
        await page.goto('/games/systems-discovery?pack=grow');
        // Intro
        await page.getByRole('button', {name: /Begin|Skip intro/i}).click();
        // BG1
        // Assert meter in steady band (aria-valuenow between 45 and 65)
        const meterVal1 = await page.getByRole('meter').getAttribute('aria-valuenow');
        const v1 = Number(meterVal1);
        expect(v1).toBeGreaterThanOrEqual(45);
        expect(v1).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Continue/i}).click();
        // BG2
        const meterVal2 = await page.getByRole('meter').getAttribute('aria-valuenow');
        const v2 = Number(meterVal2);
        expect(v2).toBeGreaterThanOrEqual(45);
        expect(v2).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Continue/i}).click();
        // BG3
        const meterVal3 = await page.getByRole('meter').getAttribute('aria-valuenow');
        const v3 = Number(meterVal3);
        expect(v3).toBeGreaterThanOrEqual(45);
        expect(v3).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Reveal/i}).click();

        await expect(page.getByText(/Care Ally badge/i)).toBeVisible();
        await expect(page.getByText(/Grow badge/i)).toBeVisible();
    });
});
