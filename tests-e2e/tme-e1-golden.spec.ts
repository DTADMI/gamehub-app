// tests-e2e/tme-e1-golden.spec.ts
import {expect, test} from "@playwright/test";

test.describe('[e2e:smoke] TME E1 golden path (pipes + latch)', () => {
    test('solve pipes gate and reveal latch via long-press then drag', async ({page}) => {
        await page.goto('/games/toymaker-escape');

        // Ensure page loaded (EN title by default)
        await expect(page.getByRole('heading', {level: 2})).toContainText('Toymaker Escape');

        // Solve the simple pipes gate by opening the valve
        const openValve = page.getByRole('button', {name: /Open valve|Ouvrir la vanne/i});
        await expect(openValve).toBeVisible();
        await openValve.click();
        await expect(page.getByText(/Pipes: Solved|Tuyaux: Résolu/)).toBeVisible();

        // Confirm pipes
        const confirmPipes = page.getByRole('button', {name: /Confirm pipes|Valider les tuyaux/i});
        await confirmPipes.click();

        // Perform long-press then drag on scuff area to reveal latch
        const scuff = page.getByTestId('scuff-area');
        await expect(scuff).toBeVisible();

        const box = await scuff.boundingBox();
        if (!box) throw new Error('scuff-area not found');

        const {x, y, width, height} = box;
        // Move to center
        await page.mouse.move(x + width / 2, y + height / 2);
        // Press and hold
        await page.mouse.down();
        await page.waitForTimeout(900); // ≥ long-press threshold (800ms)
        // Drag a little
        await page.mouse.move(x + width / 2 + 10, y + height / 2);
        await page.mouse.up();

        // Expect latch revealed status text
        await expect(page.getByText(/Latch revealed\.|Loquet révélé\./)).toBeVisible();

        // Medal should surface once a gate is solved and latch revealed
        const medalLine = page.getByTestId('medal-line');
        await expect(medalLine).toBeVisible();
        await expect(medalLine).toContainText(/Medal:|Médaille\s*:/);

        // Quick i18n sanity: toggle FR and see FR text for the panel heading or title
        const frBtn = page.getByTestId('lang-fr');
        await frBtn.click();
        await expect(page.getByRole('heading', {level: 2})).toContainText('Épisode 1');
        // Medal label should be localized too
        await expect(medalLine).toContainText('Médaille');
    });
});
