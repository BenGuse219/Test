import { test, expect } from '@playwright/test';

test.describe('HandyBid AI - Basic Flow', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check for main branding
    await expect(page.locator('h1')).toContainText('HandyBid AI');
    await expect(page.locator('text=Professional Estimates in Seconds')).toBeVisible();
  });

  test('should display the form elements correctly', async ({ page }) => {
    await page.goto('/');

    // Check form elements exist
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[type="file"][name="photos"]')).toBeAttached();
    await expect(page.locator('button:has-text("Generate Estimate")')).toBeVisible();
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    await page.goto('/');

    // Try to submit without description
    const submitButton = page.locator('button:has-text("Generate Estimate")');
    await submitButton.click();

    // HTML5 validation should prevent submission
    const textarea = page.locator('textarea[name="description"]');
    const validationMessage = await textarea.evaluate((el: HTMLTextAreaElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should display empty state when no estimate generated', async ({ page }) => {
    await page.goto('/');

    // Check for empty state
    await expect(page.locator('text=Your estimate will appear here')).toBeVisible();
    await expect(page.locator('text=Fill out the form to get started')).toBeVisible();
  });

  test('should show "How it works" information', async ({ page }) => {
    await page.goto('/');

    // Check info card
    await expect(page.locator('text=How it works')).toBeVisible();
    await expect(page.locator('text=Describe the job in detail')).toBeVisible();
    await expect(page.locator('text=Upload photos for AI visual analysis')).toBeVisible();
    await expect(page.locator('text=Get instant itemized estimates')).toBeVisible();
    await expect(page.locator('text=Download PDF to share with customers')).toBeVisible();
  });

  test('should have proper page title and meta', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/HandyBid AI/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Estimate")')).toBeVisible();
  });
});
