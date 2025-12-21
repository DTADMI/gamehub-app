import {expect, test} from "@playwright/test";

test.describe("Rite of Discovery — flow", () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => localStorage.clear());
    });

    test("receipt branch S1→S2→S3(receipt)→EP", async ({page}) => {
        await page.goto("/games/rite-of-discovery");
        // S1: rotate to 1-2-3: click each piece twice
        await page.getByRole('button', {name: /Piece 1/}).click();
        await page.getByRole('button', {name: /Piece 1/}).click();
        await page.getByRole('button', {name: /Piece 2/}).click();
        await page.getByRole('button', {name: /Piece 2/}).click();
        await page.getByRole('button', {name: /Piece 3/}).click();
        await page.getByRole('button', {name: /Piece 3/}).click();
        await page.getByRole('button', {name: /Assemble Tag and Continue/}).click();

        // S2: toggle A, B, C then continue
        await page.getByRole('button', {name: 'A'}).click();
        await page.getByRole('button', {name: 'B'}).click();
        await page.getByRole('button', {name: 'C'}).click();
        await page.getByRole('button', {name: 'Continue'}).click();

        // S3: pick receipt
        await page.getByTestId('choice-receipt').click();

        // EP: assert texts
        await expect(page.getByRole('heading', {name: /Epilogue/})).toBeVisible();
        await expect(page.getByText(/Helper Badge/)).toBeVisible();
        await expect(page.getByText(/S3 path: receipt/)).toBeVisible();
    });

    test("overhear branch S1→S2→S3(overhear)→EP", async ({page}) => {
        await page.goto("/games/rite-of-discovery");
        // Clear save to start fresh
        await page.evaluate(() => localStorage.removeItem('rod:save:v1'));
        // S1
        await page.getByRole('button', {name: /Piece 1/}).click();
        await page.getByRole('button', {name: /Piece 1/}).click();
        await page.getByRole('button', {name: /Piece 2/}).click();
        await page.getByRole('button', {name: /Piece 2/}).click();
        await page.getByRole('button', {name: /Piece 3/}).click();
        await page.getByRole('button', {name: /Piece 3/}).click();
        await page.getByRole('button', {name: /Assemble Tag and Continue/}).click();
        // S2
        await page.getByRole('button', {name: 'A'}).click();
        await page.getByRole('button', {name: 'B'}).click();
        await page.getByRole('button', {name: 'C'}).click();
        await page.getByRole('button', {name: 'Continue'}).click();
        // S3: overhear
        await page.getByTestId('choice-overhear').click();
        await expect(page.getByText(/S3 path: overhear/)).toBeVisible();
    });
});
