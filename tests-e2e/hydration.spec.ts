import { expect, test } from "@playwright/test";

test("no hydration mismatch errors on home", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      errors.push(t);
    }
  });

  await page.goto("/");
  // Basic visible smoke to ensure page rendered
  await expect(page.getByRole("heading", { name: /Featured Games/i })).toBeVisible();

  // Fail if a hydration warning/error appears in the console
  const bad = errors.find((e) =>
    /hydration|didn\'t match the client properties|A tree hydrated/i.test(e),
  );
  expect(bad, bad || "").toBeFalsy();
});
