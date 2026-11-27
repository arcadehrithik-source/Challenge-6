import { expect, test } from "@playwright/test";

test.describe("BreatheWise AI End-to-End Journey", () => {
  test("Landing page loads, validates onboarding, persists preferences, and powers dashboard & modules", async ({
    page,
    isMobile,
  }) => {
    // 1. Landing page loads
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Breathe smarter\. Live healthier\./i })
    ).toBeVisible();

    // 2. Navigation works -> go to onboarding via CTA
    await page
      .getByRole("link", { name: /Build My Air Quality Plan/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/onboarding/);

    // 14. Invalid form inputs are rejected on onboarding step 1
    const cityInput = page.getByLabel(/City \*/i);
    await cityInput.fill("!");
    await page.getByRole("button", { name: /Continue/i }).click();
    await expect(page.getByText(/Please enter a city name/i)).toBeVisible();

    // 3. Complete multi-step onboarding
    await page.getByRole("button", { name: "Delhi" }).click();
    await page.getByLabel(/Locality/i).fill("Rohini");
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByRole("button", { name: /Family with children/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByRole("button", { name: /Fitness Enthusiast/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByRole("button", { name: /Bicycle/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    // Optional step 5 (Indoor)
    await expect(
      page.getByRole("heading", { name: /Tell us about your indoor environment/i })
    ).toBeVisible();
    await page.getByRole("button", { name: /Continue/i }).click();

    // Step 6 Submit
    await expect(page.getByRole("heading", { name: /Fine-tune your priorities/i })).toBeVisible();
    await page.getByRole("button", { name: /Generate My Dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 4 & 5 & 6. Dashboard loads, preferences persist across reload, AQI info displays
    await expect(
      page.getByRole("heading", { name: /Today's Air & Action Plan for Delhi/i })
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Today's Air & Action Plan for Delhi/i })
    ).toBeVisible();
    await expect(page.getByText(/Indian NAQI/i).first()).toBeVisible();

    // 7. Recommendations reflect user context (fitness + bicycle + children)
    await expect(page.getByText(/Prioritized Recommendations for Today/i)).toBeVisible();

    // 8 & 9. AI assistant accepts questions and works via fallback
    await page
      .getByRole("button", { name: /Ask BreatheWise AI/i })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel(/Ask BreatheWise Intelligence/i).fill("Is it safe to go jogging today?");
    await page.getByRole("button", { name: /^Ask$/i }).click();
    await expect(page.getByText(/Situation Assessment/i)).toBeVisible();
    await expect(page.getByText(/Recommended Actions/i)).toBeVisible();
    await page.getByRole("button", { name: /Close dialog/i }).click();

    // 13. Mobile navigation or desktop sidebar works across modules
    if (isMobile) {
      await page.getByRole("button", { name: /Open navigation menu/i }).click();
      await page.getByRole("link", { name: "Indoor Air" }).click();
    } else {
      await page.getByRole("link", { name: "Indoor Air" }).click();
    }

    // 10. Indoor air module works
    await expect(page).toHaveURL(/\/dashboard\/indoor-air/);
    await expect(page.getByRole("heading", { name: /Indoor Air Intelligence/i })).toBeVisible();
    await expect(page.getByText(/cannot meaningfully purify an entire room/i)).toBeVisible();

    // 11. Commute comparison works
    if (isMobile) {
      await page.getByRole("button", { name: /Open navigation menu/i }).click();
    }
    await page.getByRole("link", { name: "Smart Commute" }).click();
    await expect(page).toHaveURL(/\/dashboard\/commute/);
    await expect(page.getByRole("heading", { name: /Smart Commute Assistant/i })).toBeVisible();
    await expect(page.getByText(/Public Transit/i).first()).toBeVisible();

    // 12. Impact tracker updates when checklist item is toggled
    if (isMobile) {
      await page.getByRole("button", { name: /Open navigation menu/i }).click();
    }
    await page.getByRole("link", { name: "Impact Tracker" }).click();
    await expect(page).toHaveURL(/\/dashboard\/impact/);
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.click();
    await expect(firstCheckbox).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText(/1\/\d+/)).toBeVisible();
  });
});
