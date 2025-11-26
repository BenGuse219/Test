import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for testing PRODUCTION deployment
 * Does NOT start local dev server - tests against live site
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2, // Retry on production in case of network issues
  workers: 1, // Sequential for production
  reporter: 'list',

  use: {
    baseURL: 'https://drfblw58o2mrh.cloudfront.net',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // NO webServer - we test against live production
});
