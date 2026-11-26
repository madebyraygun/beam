import { defineConfig } from '@playwright/test';

// The Chrome installed on this computer, so nothing is downloaded; set
// BEAM_E2E_CHANNEL to nothing to use Playwright's own Chromium instead.
export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  timeout: 30_000,
  workers: 1,
  reporter: [['list']],
  use: {
    channel: process.env.BEAM_E2E_CHANNEL ?? 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://localhost:9191',
  },
  webServer: {
    command: 'npx vite --config e2e/vite.config.ts',
    url: 'http://localhost:9191',
    reuseExistingServer: false,
  },
});
