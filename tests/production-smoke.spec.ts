import { test, expect } from '@playwright/test';

/**
 * Simple smoke test for production deployment
 * Tests basic functionality without requiring extensive setup
 */

test.describe('Production Smoke Test', () => {
  test('should load the production homepage', async ({ page }) => {
    await page.goto('/');

    // Check page loads
    await expect(page).toHaveTitle(/HandyBid AI/);

    // Check main elements are visible
    await expect(page.locator('h1')).toContainText('HandyBid AI');
    await expect(page.locator('text=Professional Estimates in Seconds')).toBeVisible();
  });

  test('should display the form correctly', async ({ page }) => {
    await page.goto('/');

    // Check form elements
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Estimate")')).toBeVisible();
    await expect(page.locator('text=Photos (Optional)')).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await page.goto('/');

    // Check empty state message
    await expect(page.locator('text=Your estimate will appear here')).toBeVisible();
    await expect(page.locator('text=Fill out the form to get started')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Key elements should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('should generate a real estimate', async ({ page }) => {
    // Skip if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Fill in description
    await page.locator('textarea[name="description"]').fill('Replace a broken window pane');

    // Submit
    await page.locator('button:has-text("Generate Estimate")').click();

    // Wait for loading
    await expect(page.locator('text=Analyzing & Generating')).toBeVisible({ timeout: 5000 });

    // Wait for result (production may be slower on first run)
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 60000 });

    // Verify estimate has content
    const estimateContent = page.locator('.prose');
    await expect(estimateContent).toBeVisible();

    const text = await estimateContent.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(50);
  });
});
