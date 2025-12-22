import {expect, test} from "@playwright/test";

test.describe("Systems Discovery — BOD Breath scaffold", () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test("Breath intro → BB1→BB3 → Wrap (deep-link)", async ({page}) => {
    // Deep-link directly into the Breath sub-pack
    await page.goto("/games/systems-discovery?pack=breath");

    // Breath Intro → BB1
    await page.getByRole("button", {name: /Begin|Skip intro/i}).first().click();
    // BB1 → Continue
    await expect(page.getByRole("heading", {name: /BB1/i})).toBeVisible();
    await page.getByRole("button", {name: /Continue|sysdisc\.bod\.common\.continue/}).click();
    // BB2 → Continue
    await expect(page.getByRole("heading", {name: /BB2/i})).toBeVisible();
    await page.getByRole("button", {name: /Continue|sysdisc\.bod\.common\.continue/}).click();
    // BB3 → Reveal
    await expect(page.getByRole("heading", {name: /BB3/i})).toBeVisible();
    await page.getByRole("button", {name: /Reveal|sysdisc\.bod\.common\.reveal/}).click();

    // Wrap shows badges lines
    await expect(page.getByRole("heading", {name: /Wrap — Breath/i})).toBeVisible();
    await expect(page.getByText(/Care Ally badge/)).toBeVisible();
  });
});
