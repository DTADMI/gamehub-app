import {expect, test} from "@playwright/test";

test.describe("Memory MVP", () => {
    test("flipping two cards increments moves", async ({page}) => {
        await page.goto("/games/memory");
        await page.waitForLoadState("domcontentloaded");

        // Wait for the game to be interactive
        await expect(page.getByRole("heading", {name: /Memory Card Game/i})).toBeVisible();

        // Dismiss overlay if present
        const startButton = page.getByRole("button", {name: /Tap to start|Start|Play Again|Tap to resume/i});
        if (await startButton.isVisible().catch(() => false)) {
            await startButton.click();
        }

        // Click two different cards
        const cards = page.locator('[data-testid="memory-card"]');
        await expect(cards.first()).toBeVisible();

        // Get the first two cards
        const firstCard = cards.nth(0);
        const secondCard = cards.nth(1);

        // Click the first card
        await firstCard.click();

        // Click the second card
        await secondCard.click();

        // Expect moves to be at least 1
        await expect(page.getByText(/Moves?:\s*\d+/)).toBeVisible();
        await expect(page.getByText(/Moves?:\s*[1-9]\d*/)).toBeVisible();
    });
});