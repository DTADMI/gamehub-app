import {expect, test} from '@playwright/test';

test.describe('Systems Discovery — Core Beta', () => {
    test('complete B1→B3 and reach WRAP (bus-first plan)', async ({page}) => {
        await page.goto('/games/systems-discovery');
        // B1 ordered steps
        await page.getByRole('button', {name: /Kitchen scraps/i}).click();
        await page.getByRole('button', {name: /Compost bin/i}).click();
        await page.getByRole('button', {name: /Soil mix/i}).click();
        await page.getByRole('button', {name: /Herb planter/i}).click();
        await page.getByRole('button', {name: /Continue/i}).click();

        // B2 choose bus-first
        await page.getByRole('button', {name: /Bus then Bike/i}).click();

        // B3 sorting with hints off
        await page.getByRole('button', {name: /Finish sorting/i}).isDisabled();
        await page.getByRole('button', {name: /Banana peel/i}).click();
        await page.getByRole('button', {name: /Plastic bottle/i}).click();
        await page.getByRole('button', {name: /Paper scrap/i}).click();
        await page.getByRole('button', {name: /Finish sorting/i}).click();

        await expect(page.getByText(/Systems Scout badge/i)).toBeVisible();
        await expect(page.locator('li', {hasText: /B2 plan/i})).toContainText('bus-first');
    });
});
