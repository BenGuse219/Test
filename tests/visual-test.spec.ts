import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Visual test - captures screenshots and tests real functionality
 */

test.describe('Visual & Functional Verification', () => {
  test('capture homepage screenshots and verify design', async ({ page }) => {
    // Go to production site
    await page.goto('https://k0c4dkc137.execute-api.us-east-1.amazonaws.com/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Take full page screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, '1-homepage-full.png'),
      fullPage: true
    });

    // Take viewport screenshot (above the fold)
    await page.screenshot({
      path: path.join(screenshotsDir, '2-homepage-viewport.png'),
    });

    // Check key elements are visible
    await expect(page.locator('h1')).toContainText('HandyBid AI');
    await expect(page.locator('text=Professional Estimates in Seconds')).toBeVisible();

    // Screenshot the form area
    const formArea = page.locator('form').first();
    await formArea.screenshot({
      path: path.join(screenshotsDir, '3-form-area.png')
    });

    // Screenshot the info card
    const infoCard = page.locator('text=How it works').locator('..');
    await infoCard.screenshot({
      path: path.join(screenshotsDir, '4-info-card.png')
    });

    console.log('✅ Screenshots saved to: ' + screenshotsDir);
  });

  test('test real estimate generation with actual prompt', async ({ page }) => {
    // Skip if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      test.skip();
      return;
    }

    await page.goto('https://k0c4dkc137.execute-api.us-east-1.amazonaws.com/');
    await page.waitForLoadState('networkidle');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Fill in a realistic job description
    const jobDescription = 'Replace a broken window in the living room - double pane, approximately 36x48 inches';

    await page.locator('textarea[name="description"]').fill(jobDescription);

    // Screenshot before submission
    await page.screenshot({
      path: path.join(screenshotsDir, '5-filled-form.png'),
      fullPage: true
    });

    // Submit the form
    await page.locator('button:has-text("Generate Estimate")').click();

    // Screenshot loading state
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, '6-loading-state.png'),
      fullPage: true
    });

    // Wait for estimate to appear
    await expect(page.locator('text=Bid Estimate')).toBeVisible({ timeout: 60000 });

    // Screenshot the result
    await page.screenshot({
      path: path.join(screenshotsDir, '7-estimate-result.png'),
      fullPage: true
    });

    // Get the estimate text
    const estimateContent = await page.locator('.prose').textContent();

    // Verify estimate has meaningful content
    expect(estimateContent).toBeTruthy();
    expect(estimateContent!.length).toBeGreaterThan(100);
    expect(estimateContent!.toLowerCase()).toMatch(/labor|materials|total|cost|window/);

    console.log('\n✅ ESTIMATE GENERATED SUCCESSFULLY!\n');
    console.log('Job Description:', jobDescription);
    console.log('\nGenerated Estimate Preview:');
    console.log('─'.repeat(80));
    console.log(estimateContent!.substring(0, 500) + '...');
    console.log('─'.repeat(80));
    console.log('\nFull estimate length:', estimateContent!.length, 'characters');
    console.log('\n📸 All screenshots saved to:', screenshotsDir);
  });

  test('test mobile view', async ({ page }) => {
    // Set to iPhone viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://k0c4dkc137.execute-api.us-east-1.amazonaws.com/');
    await page.waitForLoadState('networkidle');

    const screenshotsDir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Screenshot mobile view
    await page.screenshot({
      path: path.join(screenshotsDir, '8-mobile-view.png'),
      fullPage: true
    });

    // Verify mobile responsiveness
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();

    console.log('✅ Mobile screenshot captured');
  });
});
