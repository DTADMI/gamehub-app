import {expect, test} from '@playwright/test';

test.describe('Toymaker Escape — E1 Beta', () => {
    test('gears route, no hints → gold medal', async ({page}) => {
        await page.goto('/games/toymaker-escape');
        // Ensure on E1A, pick gears
        await page.getByRole('button', {name: /Gears/i}).click();
        // Rotate dials to 1-3-2
        // Dial 1 already 1 by default; set dial 2 to 3: click twice
        await page.getByRole('button', {name: /Dial 2 value/i}).click();
        await page.getByRole('button', {name: /Dial 2 value/i}).click();
        // Dial 3 to 2: click once
        await page.getByRole('button', {name: /Dial 3 value/i}).click();
        await expect(page.getByRole('button', {name: 'Continue'})).toBeEnabled();
        await page.getByRole('button', {name: 'Continue'}).click();

        // E1B sorter: set no hints
        await page.getByRole('button', {name: /No hints/i}).click();
        // Select all three items
        await page.getByRole('button', {name: /Red/i}).click();
        await page.getByRole('button', {name: /Blue/i}).click();
        await page.getByRole('button', {name: /Green/i}).click();
        await expect(page.getByRole('button', {name: /Reveal Key Fragment 1/i})).toBeEnabled();
        await page.getByRole('button', {name: /Reveal Key Fragment 1/i}).click();

        // DONE screen: medal gold expected
        await expect(page.locator('li', {hasText: /Medal/i})).toContainText('gold');
    });

    test('music route, hints → bronze/silver', async ({page}) => {
        await page.goto('/games/toymaker-escape');
        // Choose music path
        await page.getByRole('button', {name: /Music/i}).click();
        await page.getByRole('button', {name: 'Continue'}).click();
        // Use hints
        await page.getByRole('button', {name: /Use hints/i}).click();
        await page.getByRole('button', {name: /Red/i}).click();
        await page.getByRole('button', {name: /Blue/i}).click();
        await page.getByRole('button', {name: /Green/i}).click();
        await page.getByRole('button', {name: /Reveal Key Fragment 1/i}).click();
        // Medal should not be gold for music path with hints
        const medal = await page.locator('li', {hasText: /Medal/i}).textContent();
        expect(medal?.toLowerCase()).not.toContain('gold');
    });
});
