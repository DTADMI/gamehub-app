// tests-e2e/rod-golden.spec.ts
import {expect, test} from "@playwright/test";

test.describe('[e2e:smoke] Rite of Discovery golden path', () => {
    test('solve keypad and wires to reach inner chamber', async ({page}) => {
        await page.goto('/games/rite-of-discovery');

        // Intro
        await expect(page.getByRole('heading', {level: 2})).toContainText(/Rite of Discovery/);
        await page.getByRole('button', {name: /Begin|Commencer/i}).click();

        // Hallway -> Keypad
        await expect(page.getByText(/The Dim Hallway|Le couloir sombre/)).toBeVisible();
        await page.getByRole('button', {name: /Enter code|Entrer le code/i}).click();

        // Keypad solve: 1234
        for (const digit of ['1', '2', '3', '4']) {
            await page.getByRole('button', {name: digit, exact: true}).click();
        }
        await page.getByRole('button', {name: /Submit|Valider/i}).click();
        await expect(page.getByText(/Unlocked|Déverrouillé/)).toBeVisible();
        await page.getByRole('button', {name: /Back|Retour/i}).click();

        // Hallway -> Wires
        await page.getByRole('button', {name: /Open Panel|Ouvrir le panneau/i}).click();

        // Wires solve: red L1-R2, blue L2-R1
        const selects = page.locator('select');
        await selects.nth(0).selectOption('L1-R2');
        await selects.nth(1).selectOption('L2-R1');
        await expect(page.getByText(/Wires: Solved|Fils : Résolu/)).toBeVisible();
        await page.getByRole('button', {name: /Back|Retour/i}).click();

        // Hallway -> Inner Chamber
        await expect(page.getByRole('button', {name: /Enter the chamber|Entrer dans la chambre/i})).toBeVisible();
        await page.getByRole('button', {name: /Enter the chamber|Entrer dans la chambre/i}).click();

        // Inner Chamber
        await expect(page.getByText(/The Inner Chamber|La chambre intérieure/)).toBeVisible();
        await expect(page.getByRole('button', {name: /Restart|Recommencer/i})).toBeVisible();
    });
});
