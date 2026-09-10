import { defineConfig, devices } from 'playwright/test'
import path from 'path'

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Global test timeout
  timeout: 30000,

  // Global expect timeout
  expect: {
    timeout: 5000,
  },

  // Fail build on CI if test.only is left in source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Parallelize in CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/playwright-report.json' }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Capture trace on failure
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 15000,
  },

  // Configure projects for different browsers
  projects: [
    // Auth setup runs once and saves storage state for dependent projects
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Authenticated tests
    {
      name: 'authenticated',
      testMatch: '**/authenticated/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: path.join(__dirname, 'tests/e2e/.auth/user.json'),
      },
    },

    // Admin tests
    {
      name: 'admin',
      testMatch: '**/admin/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: path.join(__dirname, 'tests/e2e/.auth/admin.json'),
      },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
