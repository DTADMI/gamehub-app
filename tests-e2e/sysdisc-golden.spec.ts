// tests-e2e/sysdisc-golden.spec.ts
import {expect, test} from "@playwright/test";

test.describe('[e2e:smoke] Systems Discovery golden path', () => {
    test('complete Core pack via ordered loop, plan, and sort', async ({page}) => {
        await page.goto('/games/systems-discovery');

        // Intro
        await expect(page.getByRole('heading', {level: 2})).toContainText(/Systems Discovery/);
        await page.getByRole('button', {name: /Begin|Commencer/i}).click();

        // B1: Closing the Loop
        await expect(page.getByText(/Closing the Loop|Boucler la boucle/)).toBeVisible();
        const loopOrder = [/Kitchen|Cuisine/, /Compost/, /Soil|Terreau/, /Herbs/];
        for (const label of loopOrder) {
            await page.getByRole('button', {name: label}).click();
        }
        await page.getByRole('button', {name: /Continue|Continuer/i}).click();

        // B2: Route Planning
        await expect(page.getByText(/Route Planning|Planification/)).toBeVisible();
        await page.getByRole('button', {name: /Bus/i}).click();

        // B3: Waste Sorting
        await expect(page.getByText(/Waste Sorting|Tri des déchets/)).toBeVisible();
        const items = [/Banana|Banane/, /Bottle|Bouteille/, /Newspaper|Journal/];
        for (const item of items) {
            await page.getByRole('button', {name: item}).click();
        }
        await page.getByRole('button', {name: /Finish Episode|Terminer l'épisode/i}).click();

        // Wrap
        await expect(page.getByText(/Systems Explored|Systèmes explorés/)).toBeVisible();
        await expect(page.getByRole('button', {name: /View outro|outro/i})).toBeVisible();
    });
});
