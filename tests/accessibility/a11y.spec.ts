import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES_TO_AUDIT = [
  "/",
  "/onboarding",
  "/dashboard",
  "/dashboard/air-quality",
  "/dashboard/plan",
  "/dashboard/indoor-air",
  "/dashboard/commute",
  "/dashboard/sustainability",
  "/dashboard/impact",
  "/dashboard/community",
  "/dashboard/settings",
];

test.describe("WCAG 2.2 AA Automated Accessibility Audit", () => {
  for (const route of ROUTES_TO_AUDIT) {
    test(`Route ${route} passes axe-core WCAG 2.0/2.1/2.2 AA checks`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(
        results.violations,
        `Violations on ${route}: ${JSON.stringify(results.violations)}`
      ).toEqual([]);
    });
  }

  test("Keyboard Tab navigation and Escape key dismissal work without focus traps", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();

    await page
      .getByRole("button", { name: /Ask BreatheWise AI/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
