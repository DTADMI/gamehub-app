import {expect, test} from "@playwright/test";

test.describe("Breakout — particles controls & emissions toggle", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/games/breakout");
    });

    test("Particles controls are visible and effect can be switched live", async ({page}) => {
        // App shell and canvas present
        const appShell = page.getByRole("application", {name: /Breakout game/i});
        await expect(appShell).toBeVisible();
        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible();

        // Particles toggle and selector should be visible under the settings strip
        const particlesCheckbox = page.getByLabel("Particles");
        await expect(particlesCheckbox).toBeVisible();

        const effectSelect = page.getByLabel("Particle effect");
        await expect(effectSelect).toBeVisible();

        // Enable particles and switch effect live
        await particlesCheckbox.check();
        await effectSelect.selectOption("puff");
        await effectSelect.selectOption("sparks");
    });

    test("Debug emitter helps verify brick-hit emissions toggle path", async ({page}) => {
        // Start the game to ensure canvas updates
        const startBtn = page.locator('button:has-text("Start Game")');
        if (await startBtn.isVisible()) {
            await startBtn.click();
        } else {
            const tapToStart = page.getByRole("button", {name: /Tap to start/i});
            if (await tapToStart.isVisible()) await tapToStart.click();
        }

        // Open Debug section and enable particles + debug emitter
        const debugSummary = page.locator("summary", {hasText: "Debug"});
        await debugSummary.click();

        const particlesCheckbox = page.getByLabel("Particles");
        await particlesCheckbox.check();

        const debugParticlesCheckbox = page.getByLabel(/Particles debug/i);
        await expect(debugParticlesCheckbox).toBeVisible();

        await debugParticlesCheckbox.check();
        // Wait a short moment for any debug emissions to render without asserting pixels
        await page.waitForTimeout(250);
        await debugParticlesCheckbox.uncheck();
    });
});
