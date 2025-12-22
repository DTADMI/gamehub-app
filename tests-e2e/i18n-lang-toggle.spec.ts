// tests-e2e/i18n-lang-toggle.spec.ts
import {expect, test} from "@playwright/test";

test.describe('[e2e:smoke] Header language toggle', () => {
    test('toggles EN → FR on Toymaker Escape page', async ({page}) => {
        // Go directly to a page that renders copy via i18n `t()`
        await page.goto('/games/toymaker-escape');

        // Assert EN by default (title string from i18n)
        await expect(page.getByRole('heading', {level: 2})).toContainText('Toymaker Escape — Episode 1');

        // Click FR
        await page.getByTestId('lang-fr').click();

        // Title should switch to FR
        await expect(page.getByRole('heading', {level: 2})).toContainText('Toymaker Escape — Épisode 1');

        // Toggle back to EN
        await page.getByTestId('lang-en').click();
        await expect(page.getByRole('heading', {level: 2})).toContainText('Toymaker Escape — Episode 1');
    });
});
