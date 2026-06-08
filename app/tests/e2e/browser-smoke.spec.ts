import { expect, test } from "@playwright/test";

test("serves CereBro with app icon metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("CereBro");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/site.webmanifest");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icons/cerebro-icon-180.png");
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute("href", "/icons/cerebro-icon-32.png");
});

test("opens the Browser panel from the app shell", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open Browser", exact: true }).click();

  await expect(page.getByRole("region", { name: "Browser", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Browser address and search field" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New browser tab" })).toBeVisible();
  await expect(page.getByText("Where to next?")).toBeVisible();
});
