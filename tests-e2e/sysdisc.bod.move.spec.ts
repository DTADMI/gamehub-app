import {expect, test} from "@playwright/test";

test.describe('Systems Discovery — BOD Move', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test('Move pack via deep-link: Intro → BM1→BM3 → Wrap; meter steady', async ({page}) => {
        await page.goto('/games/systems-discovery?pack=move');
        await page.getByRole('button', {name: /Begin|Skip intro/i}).click();
        const m1 = Number(await page.getByRole('meter').getAttribute('aria-valuenow'));
        expect(m1).toBeGreaterThanOrEqual(45);
        expect(m1).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Continue/i}).click();
        const m2 = Number(await page.getByRole('meter').getAttribute('aria-valuenow'));
        expect(m2).toBeGreaterThanOrEqual(45);
        expect(m2).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Continue/i}).click();
        const m3 = Number(await page.getByRole('meter').getAttribute('aria-valuenow'));
        expect(m3).toBeGreaterThanOrEqual(45);
        expect(m3).toBeLessThanOrEqual(65);
        await page.getByRole('button', {name: /Reveal/i}).click();

        await expect(page.getByText(/Care Ally badge/i)).toBeVisible();
        await expect(page.getByText(/Move badge/i)).toBeVisible();
    });
});
