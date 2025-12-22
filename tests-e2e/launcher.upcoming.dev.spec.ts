import {expect, test} from "@playwright/test";

test.describe("Launcher — Upcoming playable in dev/local", () => {
    test("Knitzy card is clickable in E2E/dev and opens the route", async ({page}) => {
        await page.goto("/games");
        const card = page.getByRole("heading", {name: /Knitzy/i});
        await expect(card).toBeVisible();
        // The Play Now link should be present for Dev‑Playable
        const playNow = page.getByRole("link", {name: /Play Now/i}).filter({hasText: "Play Now"});
        await expect(playNow.first()).toBeVisible();
        await playNow.first().click();
        await expect(page).toHaveURL(/\/games\/knitzy/);
        // Loading state appears because component is dynamically imported
        await expect(page.getByText(/Loading game/i)).toBeVisible({timeout: 10_000});
    });
});
