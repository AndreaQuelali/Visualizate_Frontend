import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests drive the real app: Vite on :5173, the API on :3000 (with
 * its render/review worker), PostgreSQL, Redis, MinIO and Mailpit. In CI the
 * backend repo is checked out next to this one (see .github/workflows/e2e.yml).
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  // One long, ordered user journey: no parallelism, no retries hiding flakes.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'es',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
