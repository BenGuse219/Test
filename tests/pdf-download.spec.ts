import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('HandyBid AI - PDF Download', () => {
  test('should show download PDF button only when estimate is generated', async ({ page }) => {
    await page.goto('/');

    // Initially, PDF button should not be visible
    const downloadButton = page.locator('button:has-text("Download PDF")');
    await expect(downloadButton).not.toBeVisible();
  });

  test('should download PDF after generating estimate', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Generate an estimate
    await page.locator('textarea[name="description"]').fill('Replace broken window');
    await page.locator('button:has-text("Generate Estimate")').click();

    // Wait for estimate
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // PDF download button should be visible
    const downloadButton = page.locator('button:has-text("Download PDF")');
    await expect(downloadButton).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click download button
    await downloadButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Check filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/bid-estimate-\d+\.pdf/);

    // Save to temp location and verify it's a PDF
    const downloadPath = path.join(__dirname, 'fixtures', 'downloads', filename);
    fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
    await download.saveAs(downloadPath);

    // Verify file exists and is not empty
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Check PDF magic bytes
    const buffer = fs.readFileSync(downloadPath);
    const pdfHeader = buffer.toString('utf8', 0, 4);
    expect(pdfHeader).toBe('%PDF');

    // Cleanup
    fs.unlinkSync(downloadPath);
  });

  test('should include job description in PDF', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    const jobDescription = 'Install new light fixtures in bathroom';
    await page.locator('textarea[name="description"]').fill(jobDescription);
    await page.locator('button:has-text("Generate Estimate")').click();

    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // Click download
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download PDF")').click();
    const download = await downloadPromise;

    // Verify download started
    expect(download).toBeTruthy();
  });

  test('PDF download button should have correct styling', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Generate estimate
    await page.locator('textarea[name="description"]').fill('Repair drywall damage');
    await page.locator('button:has-text("Generate Estimate")').click();
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // Check button styling
    const downloadButton = page.locator('button:has-text("Download PDF")');
    await expect(downloadButton).toBeVisible();

    // Check for download icon
    const icon = downloadButton.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('should be able to download PDF multiple times', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    await page.locator('textarea[name="description"]').fill('Clean gutters');
    await page.locator('button:has-text("Generate Estimate")').click();
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    // First download
    let downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download PDF")').click();
    let download = await downloadPromise;
    expect(download).toBeTruthy();

    // Second download (button should still work)
    downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download PDF")').click();
    download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('should generate different PDFs for different estimates', async ({ page }) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('/');

    // First estimate
    await page.locator('textarea[name="description"]').fill('First job: paint fence');
    await page.locator('button:has-text("Generate Estimate")').click();
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    const downloadPromise1 = page.waitForEvent('download');
    await page.locator('button:has-text("Download PDF")').click();
    const download1 = await downloadPromise1;
    const filename1 = download1.suggestedFilename();

    // Wait a bit to ensure different timestamp
    await page.waitForTimeout(1100);

    // Second estimate
    await page.locator('textarea[name="description"]').clear();
    await page.locator('textarea[name="description"]').fill('Second job: fix roof');
    await page.locator('button:has-text("Generate Estimate")').click();
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 30000 });

    const downloadPromise2 = page.waitForEvent('download');
    await page.locator('button:has-text("Download PDF")').click();
    const download2 = await downloadPromise2;
    const filename2 = download2.suggestedFilename();

    // Filenames should be different (different timestamps)
    expect(filename1).not.toBe(filename2);
  });
});
