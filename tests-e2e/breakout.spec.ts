import {expect, test} from "@playwright/test";

const pageUrl = "/games/breakout";

async function getCanvas(page: any) {
    return page.locator("canvas").first();
}

async function getDataInt(el: any, name: string) {
    const v = await el.getAttribute(`data-${name}`);
    return v ? parseInt(v, 10) : NaN;
}

test.describe("Breakout MVP", () => {
    test("paddle moves with ArrowRight", async ({page}) => {
        await page.goto(pageUrl);
        const canvas = await getCanvas(page);
        await expect(canvas).toBeVisible();

        // read initial paddle x
        const px0 = await getDataInt(canvas, "px");
        // hold ArrowRight for a short time
        await page.keyboard.down("ArrowRight");
        await page.waitForTimeout(250);
        await page.keyboard.up("ArrowRight");

        const px1 = await getDataInt(canvas, "px");
        expect(px1).toBeGreaterThan(px0);
    });

    test("space starts and pauses (ball y changes then stabilizes)", async ({page}) => {
        await page.goto(pageUrl);
        const canvas = await getCanvas(page);

        // Start
        await page.keyboard.press("Space");
        const y0 = await getDataInt(canvas, "bally");
        await page.waitForTimeout(250);
        const y1 = await getDataInt(canvas, "bally");
        expect(Number.isFinite(y0)).toBeTruthy();
        expect(Number.isFinite(y1)).toBeTruthy();
        expect(y1).not.toBe(y0);

        // Pause
        await page.keyboard.press("Space");
        const yp0 = await getDataInt(canvas, "bally");
        await page.waitForTimeout(250);
        const yp1 = await getDataInt(canvas, "bally");
        expect(yp1).toBe(yp0);
    });

    test("losing a life decrements lives data attribute", async ({page}) => {
        await page.goto(pageUrl);
        const canvas = await getCanvas(page);

        // Start
        await page.keyboard.press("Space");

        // Read initial lives
        let lives0 = await getDataInt(canvas, "lives");
        if (!Number.isFinite(lives0) || lives0 <= 0) {
            // fallback to default when attribute not yet set in first frames
            lives0 = 3;
        }

        // Wait up to 10s for a life to be lost
        let lives1 = lives0;
        const deadline = Date.now() + 10000;
        while (Date.now() < deadline) {
            lives1 = await getDataInt(canvas, "lives");
            if (Number.isFinite(lives1) && lives1 < lives0) break;
            await page.waitForTimeout(200);
        }
        expect(lives1).toBeLessThan(lives0);
    });
});
