// tests-e2e/rod-smoke.spec.ts
import {expect, test} from "@playwright/test";

test.describe('[e2e:smoke] Rite of Discovery basic flow + i18n toggle', () => {
    test('route renders, application region present, EN↔FR toggle updates pressed state', async ({page}) => {
        await page.goto('/games/rite-of-discovery');

        // App container should exist
        await expect(page.getByRole('application')).toBeVisible();

        // Toggle FR then EN and assert pressed state reflects selection
        const frBtn = page.getByTestId('lang-fr');
        const enBtn = page.getByTestId('lang-en');
        await expect(frBtn).toBeVisible();
        await expect(enBtn).toBeVisible();

        await frBtn.click();
        await expect(frBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(enBtn).toHaveAttribute('aria-pressed', 'false');

        await enBtn.click();
        await expect(enBtn).toHaveAttribute('aria-pressed', 'true');
        await expect(frBtn).toHaveAttribute('aria-pressed', 'false');
    });
});
