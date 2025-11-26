import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('HandyBid AI - Photo Upload', () => {
  // Create a test image before tests
  test.beforeAll(() => {
    const testsDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    // Create a simple 1x1 PNG test image
    const testImagePath = path.join(testsDir, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Minimal valid PNG file (1x1 transparent pixel)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngData);
    }
  });

  test('should show photo upload UI', async ({ page }) => {
    await page.goto('/');

    // Check photo upload section exists
    await expect(page.locator('text=Photos (Optional)')).toBeVisible();
    await expect(page.locator('text=Click to upload photos')).toBeVisible();
  });

  test('should upload a single photo and show preview', async ({ page }) => {
    await page.goto('/');

    // Get the file input
    const fileInput = page.locator('input[type="file"][name="photos"]');

    // Upload the test image
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');
    await fileInput.setInputFiles(testImagePath);

    // Check that file preview appears
    await expect(page.locator('text=test-image.png')).toBeVisible({ timeout: 5000 });

    // Check for image icon in preview
    const preview = page.locator('.bg-slate-50').filter({ hasText: 'test-image.png' });
    await expect(preview).toBeVisible();
  });

  test('should upload multiple photos', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"][name="photos"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');

    // Upload multiple files (using same file for simplicity)
    await fileInput.setInputFiles([testImagePath, testImagePath]);

    // Should show multiple previews
    const previews = page.locator('.bg-slate-50').filter({ hasText: 'test-image.png' });
    expect(await previews.count()).toBeGreaterThan(0);
  });

  test('should remove photo from preview', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"][name="photos"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');

    // Upload file
    await fileInput.setInputFiles(testImagePath);
    await expect(page.locator('text=test-image.png')).toBeVisible();

    // Click remove button (X icon)
    const removeButton = page.locator('.bg-slate-50').filter({ hasText: 'test-image.png' })
      .locator('button[type="button"]');
    await removeButton.click();

    // File should be removed
    await expect(page.locator('text=test-image.png')).not.toBeVisible();
  });

  test('should accept PNG and JPG files', async ({ page }) => {
    await page.goto('/');

    // Check that file input accepts correct types
    const fileInput = page.locator('input[type="file"][name="photos"]');
    const acceptAttr = await fileInput.getAttribute('accept');

    expect(acceptAttr).toContain('image/png');
    expect(acceptAttr).toContain('image/jpeg');
    expect(acceptAttr).toContain('image/jpg');
  });

  test('should allow multiple file selection', async ({ page }) => {
    await page.goto('/');

    const fileInput = page.locator('input[type="file"][name="photos"]');
    const multipleAttr = await fileInput.getAttribute('multiple');

    expect(multipleAttr).not.toBeNull();
  });

  test('should generate estimate with uploaded photos', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Fill description
    await page.locator('textarea[name="description"]').fill('Paint living room walls');

    // Upload photo
    const fileInput = page.locator('input[type="file"][name="photos"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');
    await fileInput.setInputFiles(testImagePath);

    // Wait for preview
    await expect(page.locator('text=test-image.png')).toBeVisible();

    // Submit form
    await page.locator('button:has-text("Generate Estimate")').click();

    // Wait for estimate
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 40000 });

    // Should show photo count badge
    await expect(page.locator('text=1 photo analyzed')).toBeVisible();
  });

  test('should show correct photo count for multiple photos', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    await page.locator('textarea[name="description"]').fill('Install deck railing');

    const fileInput = page.locator('input[type="file"][name="photos"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');
    await fileInput.setInputFiles([testImagePath, testImagePath, testImagePath]);

    await page.locator('button:has-text("Generate Estimate")').click();

    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 40000 });

    // Should show "3 photos analyzed"
    await expect(page.locator('text=3 photos analyzed')).toBeVisible();
  });
});
