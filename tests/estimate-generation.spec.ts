import { test, expect } from '@playwright/test';

test.describe('HandyBid AI - Estimate Generation', () => {
  test('should generate estimate for simple job description', async ({ page }) => {
    // Skip if no API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Fill in job description
    const jobDescription = 'Replace kitchen faucet and install garbage disposal';
    await page.locator('textarea[name="description"]').fill(jobDescription);

    // Submit form
    await page.locator('button:has-text("Generate Estimate")').click();

    // Wait for loading state
    await expect(page.locator('text=Analyzing & Generating')).toBeVisible({ timeout: 2000 });

    // Wait for estimate to appear (AI can take a few seconds)
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // Check that estimate contains expected sections
    const estimateContent = page.locator('.prose');
    await expect(estimateContent).toBeVisible();

    // Should contain cost-related terms
    const text = await estimateContent.textContent();
    expect(text?.toLowerCase()).toMatch(/labor|materials|total|cost/);
  });

  test('should show error when API fails', async ({ page }) => {
    // This test would need to mock API failure
    // For now, we'll skip it
    test.skip();
  });

  test('should disable submit button while generating', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Fill form
    await page.locator('textarea[name="description"]').fill('Install new door');

    // Click submit
    const submitButton = page.locator('button:has-text("Generate Estimate")');
    await submitButton.click();

    // Button should be disabled immediately
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Analyzing & Generating');

    // Wait for completion
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // Button should be enabled again
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toContainText('Generate Estimate');
  });

  test('should display photo count when photos are included', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Fill description
    await page.locator('textarea[name="description"]').fill('Paint exterior walls');

    // Upload a test image (we'll need to create one or use a fixture)
    // For now, skip actual photo upload in this test
    test.skip();
  });

  test('should clear form and keep estimate on page', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Generate first estimate
    await page.locator('textarea[name="description"]').fill('Fix leaking pipe');
    await page.locator('button:has-text("Generate Estimate")').click();
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // Form should still have the description
    const textarea = page.locator('textarea[name="description"]');
    await expect(textarea).toHaveValue('Fix leaking pipe');

    // User can clear and create new estimate
    await textarea.clear();
    await textarea.fill('New job: Install ceiling fan');
    await page.locator('button:has-text("Generate Estimate")').click();

    // New estimate should appear
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });
  });
});
