import {expect, test} from "@playwright/test";

test.describe("Knitzy MVP", () => {
  test("canvas renders and painting updates progress", async ({page}) => {
    await page.goto("/games/knitzy");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", {name: "Knitzy"})).toBeVisible();

    // Dismiss overlay if present
    const start = page.getByRole("button", {name: /Tap to start|Tap to resume/i});
    if (await start.isVisible().catch(() => false)) {
      await start.click();
    }

    const canvas = page.locator('[data-testid="knitzy-canvas"]');
    await expect(canvas).toBeVisible();

    // Click near middle to paint one cell
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas box not found");
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.5);

    // Progress is announced via aria-live region; check for numeric percentage text somewhere on page
    await expect(page.locator("text=/Progress\\s+\\d+\\s*percent/i")).toBeVisible();
  });
});
