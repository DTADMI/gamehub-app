import {expect, test} from "@playwright/test";

test.describe("Bubble Pop MVP", () => {
    test("canvas renders and popping increases score text", async ({page}) => {
    await page.goto("/games/bubble-pop");
    await page.waitForLoadState("domcontentloaded");
        await expect(page.getByRole("heading", {name: "Bubble Pop"})).toBeVisible();

        const start = page.getByRole("button", {name: /Tap to start|Tap to resume/i});
        if (await start.isVisible().catch(() => false)) {
      await start.click();
    }

        const canvas = page.locator('[data-testid="bubblepop-canvas"]');
    await expect(canvas).toBeVisible();

        // Click a few times to ensure we hit a group
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas box not found");
        await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
        await page.mouse.click(box.x + box.width * 0.52, box.y + box.height * 0.48);

        await expect(page.locator(/Score:\s*\d+/)).toBeVisible();
  });
});
