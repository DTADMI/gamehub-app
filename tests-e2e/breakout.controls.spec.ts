import {expect, test} from "@playwright/test";

test.describe("Breakout — pause immobility and boosters", () => {
    test.beforeEach(async ({page}) => {
        await page.goto("/games/breakout");
    });

    test("paddle does not move while paused and moves when resumed", async ({
                                                                                page,
                                                                            }) => {
        // Ensure app shell and canvas are ready across engines (incl. mobile-safari)
        const appShell = page.getByRole("application", {name: "Breakout game"});
        await expect(appShell).toBeVisible({timeout: 20000});
        await page.waitForSelector('canvas[aria-label="Breakout playfield"]', {
            state: "attached",
            timeout: 30000,
        });
        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible({timeout: 30000});

        // Start the game (tap overlay if present)
        const overlay = page.locator('button:has-text("Tap to start")');
        const startBtn = page.locator('button:has-text("Start Game")');
        // Prefer the explicit Start Game button for reliability under overlays
        if (await startBtn.isVisible()) {
            await startBtn.click();
        } else if (await overlay.isVisible()) {
            await overlay.click();
        }

        // Ensure data attributes exist
        await expect(canvas).toHaveAttribute("data-px", /\d+/);

        // Pause using unambiguous UI button
        const pauseBtn = page.locator('[data-testid="btn-pause"]');
        await expect(pauseBtn).toBeVisible();
        await pauseBtn.click();
        const pxBefore = await canvas.getAttribute("data-px");

        // Move mouse across the canvas while paused
        const box = await canvas.boundingBox();
        if (!box) throw new Error("Canvas bounding box not found");
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);

        const pxAfterPaused = await canvas.getAttribute("data-px");
        expect(pxAfterPaused).toBe(pxBefore);

        // Resume using the same toggle button
        await expect(pauseBtn).toBeVisible();
        await pauseBtn.click();

        // Perform a touch-like drag (helps mobile emulation) and also move the mouse as fallback
        const startX = box.x + box.width * 0.2;
        const startY = box.y + box.height * 0.5;
        const endX = box.x + box.width * 0.8;
        const endY = startY;
        await page.dispatchEvent(
            'canvas[aria-label="Breakout playfield"]',
            "pointerdown",
            {
                clientX: startX,
                clientY: startY,
                pointerType: "touch",
                buttons: 1,
            } as any,
        );
        await page.dispatchEvent(
            'canvas[aria-label="Breakout playfield"]',
            "pointermove",
            {
                clientX: endX,
                clientY: endY,
                pointerType: "touch",
                buttons: 1,
            } as any,
        );
        await page.dispatchEvent(
            'canvas[aria-label="Breakout playfield"]',
            "pointerup",
            {
                clientX: endX,
                clientY: endY,
                pointerType: "touch",
                buttons: 0,
            } as any,
        );
        await page.mouse.move(startX, startY);
        await page.mouse.move(endX, endY);

        await expect(async () => {
            const pxAfterMove = await canvas.getAttribute("data-px");
            expect(pxAfterMove).not.toBe(pxBefore);
        }).toPass();
    });

    test("clicking Boost decreases boosters counter in HUD", async ({page}) => {
        // Wait for app shell and canvas to be ready (avoids early queries during warm-up)
        const appShell = page.getByRole("application", {name: "Breakout game"});
        await expect(appShell).toBeVisible({timeout: 20000});

        const overlay = page.locator('button:has-text("Tap to start")');
        if (await overlay.isVisible()) {
            await overlay.click();
        }

        const canvas = page.locator('canvas[aria-label="Breakout playfield"]');
        await expect(canvas).toBeVisible({timeout: 20000});

        // The overlay sits above the canvas and intercepts clicks. Click the overlay if present.
        const overlayBtn = page.locator('button[aria-label="Tap to start"]');
        if (await overlayBtn.isVisible()) {
            await overlayBtn.click();
        } else {
            // If mobile shows "Tap to resume" or similar when paused
            const resumeBtn = page.locator('button[aria-label="Tap to resume"]');
            if (await resumeBtn.isVisible()) {
                await resumeBtn.click();
            }
        }

        // Fallback: press Space to resume if we somehow landed paused
        await page.keyboard.press(" ");

        // Ensure we are not paused (the pause button toggles between Pause/Resume)
        const pauseBtn = page.locator('[data-testid="btn-pause"]');
        if (await pauseBtn.isVisible()) {
            const pauseText = (await pauseBtn.textContent()) || "";
            if (/Resume/i.test(pauseText)) {
                await pauseBtn.click();
            }
        }

        const boostsHud = page.locator('[data-testid="hud-boosts"]');
        await expect(boostsHud).toBeVisible();
        const textBefore = await boostsHud.textContent();
        if (!textBefore) throw new Error("Boosts HUD not found");
        const m = textBefore.match(/🚀\s*x(\d+)/);
        expect(m).not.toBeNull();
        const before = Number(m![1]);

        const boostBtn = page.locator('[data-testid="btn-boost"]');
        // Boost button renders only when game is started and not paused/awaitingNext
        // Ensure game is started and unpaused (already attempted above); retry here defensively
        if (await pauseBtn.isVisible()) {
            const pauseText2 = (await pauseBtn.textContent()) || "";
            if (/Resume/i.test(pauseText2)) {
                await pauseBtn.click();
            }
        }
        // Wait for the boost button to appear now that we are unpaused and running
        await expect(boostBtn).toBeVisible({timeout: 15000});
        await expect(boostBtn).toBeEnabled();
        await boostBtn.click();

        await expect(async () => {
            const textAfter = await boostsHud.textContent();
            if (!textAfter) throw new Error("Boosts HUD not found");
            const m2 = textAfter.match(/🚀\s*x(\d+)/);
            expect(m2).not.toBeNull();
            const after = Number(m2![1]);
            expect(after).toBe(before - 1);
        }).toPass();
    });
});
