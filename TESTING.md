# Testing Guide for HandyBid AI

This document explains how to run and write tests for the HandyBid AI application.

## Test Framework

We use **Playwright** for end-to-end testing. Playwright is a modern testing framework that:
- Tests in real browsers (Chromium, Firefox, WebKit)
- Supports parallel test execution
- Has excellent debugging tools
- Works great with modern web frameworks like Remix

## Test Structure

```
tests/
├── basic-flow.spec.ts           # Basic UI and navigation tests
├── estimate-generation.spec.ts  # AI estimate generation tests
├── photo-upload.spec.ts         # Photo upload functionality
├── pdf-download.spec.ts         # PDF generation and download
└── fixtures/                    # Test data and images
    ├── test-image.png
    └── downloads/               # Downloaded PDFs during tests
```

## Running Tests

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variable** (for tests that use AI):
   ```bash
   # Windows PowerShell
   $env:ANTHROPIC_API_KEY="sk-ant-your-key-here"

   # Mac/Linux
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

### Test Commands

```bash
# Run all tests (headless mode)
npm test

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests (step through with breakpoints)
npm run test:debug

# View last test report
npm run test:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test tests/basic-flow.spec.ts

# Run a specific test by name
npx playwright test -g "should load the homepage"

# Run only tests without @skip
npx playwright test --grep-invert "@skip"
```

## Test Categories

### 1. Basic Flow Tests (`basic-flow.spec.ts`)

Tests the fundamental UI and user experience:
- ✅ Page loads correctly
- ✅ Form elements are visible
- ✅ Validation works
- ✅ Empty state displays
- ✅ Info card shows instructions
- ✅ Responsive design on mobile

**These tests don't require an API key** and run quickly.

### 2. Estimate Generation Tests (`estimate-generation.spec.ts`)

Tests AI-powered estimate generation:
- ✅ Generates estimate from job description
- ✅ Shows loading state while generating
- ✅ Disables button during generation
- ✅ Displays photo count when included
- ✅ Allows multiple estimates

**Requires `ANTHROPIC_API_KEY`** - tests are skipped if not set.

### 3. Photo Upload Tests (`photo-upload.spec.ts`)

Tests photo upload functionality:
- ✅ Shows upload UI
- ✅ Uploads single photo with preview
- ✅ Uploads multiple photos
- ✅ Removes photos from preview
- ✅ Accepts PNG and JPG files
- ✅ Generates estimate with photos
- ✅ Shows correct photo count

**Creates test images automatically**. Vision API tests require API key.

### 4. PDF Download Tests (`pdf-download.spec.ts`)

Tests PDF generation and download:
- ✅ Shows download button after estimate
- ✅ Downloads valid PDF file
- ✅ Includes job description in PDF
- ✅ Button styling is correct
- ✅ Can download multiple times
- ✅ Different PDFs for different estimates

**Requires `ANTHROPIC_API_KEY`** for estimate generation.

## Writing New Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Interact with elements
    await page.locator('button').click();

    // Assert expectations
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use descriptive test names**:
   ```typescript
   // Good
   test('should display error when API key is missing', ...)

   // Bad
   test('test error', ...)
   ```

2. **Use proper selectors**:
   ```typescript
   // Good - specific and resilient
   page.locator('button:has-text("Generate Estimate")')
   page.locator('textarea[name="description"]')

   // Avoid - fragile
   page.locator('.button-class')
   page.locator('div > div > button')
   ```

3. **Wait for elements properly**:
   ```typescript
   // Good - wait for visibility
   await expect(page.locator('text=Estimate')).toBeVisible({ timeout: 30000 });

   // Avoid - arbitrary waits
   await page.waitForTimeout(5000);
   ```

4. **Clean up test data**:
   ```typescript
   test.afterEach(async () => {
     // Clean up files, etc.
   });
   ```

5. **Skip tests that require API keys**:
   ```typescript
   if (!process.env.ANTHROPIC_API_KEY) {
     test.skip();
     return;
   }
   ```

## Debugging Tests

### Visual Debugging with UI Mode

The easiest way to debug:
```bash
npm run test:ui
```

This opens an interactive UI where you can:
- See test results in real-time
- Step through tests
- View screenshots and videos
- Inspect DOM at any point

### Debug Mode

To step through tests with a debugger:
```bash
npm run test:debug
```

This opens a browser and pauses at each step. You can:
- Use DevTools to inspect
- Step through with Playwright Inspector
- View network requests
- Check console logs

### Screenshots and Videos

On test failure, Playwright automatically captures:
- **Screenshots**: Saved in `test-results/`
- **Traces**: Full recording of test execution

View traces:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to main/master
- Every pull request

**Required Secrets** (set in GitHub repository settings):
- `ANTHROPIC_API_KEY` - Your Claude API key
- `AWS_ACCESS_KEY_ID` - For deployment
- `AWS_SECRET_ACCESS_KEY` - For deployment

### Workflow Files

- `.github/workflows/test.yml` - Runs tests on every commit
- `.github/workflows/deploy.yml` - Tests + deploys to AWS

### Test Reports

After tests run in CI:
- View HTML reports in GitHub Actions artifacts
- Download test results for local inspection
- Reports retained for 30 days

## Testing Against Production

To test your deployed app:

```bash
# Set the production URL
export PLAYWRIGHT_BASE_URL="https://your-cloudfront-url.cloudfront.net"

# Run tests
npm test
```

## Performance Testing

Monitor test execution time:

```bash
# Run tests and see timing
npx playwright test --reporter=list
```

Slow tests (>30s) may indicate:
- Network issues
- API rate limiting
- Browser performance problems

## Troubleshooting

### Tests fail with "API Key not set"

**Solution**: Set the `ANTHROPIC_API_KEY` environment variable before running tests that require AI.

### Tests timeout waiting for estimate

**Possible causes**:
- Claude API is slow (normal: 5-15s)
- Network issues
- API rate limit hit

**Solution**: Increase timeout in test or wait a moment.

### Photo upload tests fail

**Solution**: Tests automatically create fixture images. Check that `tests/fixtures/` directory exists and is writable.

### CI tests fail but local tests pass

**Check**:
- Are all secrets set in GitHub?
- Is the Node version the same (20)?
- Are dependencies locked with package-lock.json?

## Test Coverage

Current coverage areas:
- ✅ UI components and styling
- ✅ Form validation
- ✅ Photo upload/preview
- ✅ AI estimate generation
- ✅ PDF download
- ✅ Error handling
- ✅ Mobile responsiveness

Not yet covered:
- ⏸️ S3 upload verification (requires AWS)
- ⏸️ Multiple browsers (Firefox, Safari)
- ⏸️ Accessibility testing (a11y)
- ⏸️ Performance benchmarks

## Adding More Tests

Want to add tests for new features? Follow this pattern:

1. Create a new spec file: `tests/my-feature.spec.ts`
2. Import Playwright test utilities
3. Write describe block with test name
4. Add individual test cases
5. Run locally: `npx playwright test tests/my-feature.spec.ts`
6. Commit and push - CI will run automatically!

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

**Happy Testing!** 🧪
