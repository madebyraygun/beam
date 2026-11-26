import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Components need a DOM; the theme's tests only read token text.
    environment: 'jsdom',
    environmentMatchGlobs: [['theme-tests/**', 'node']],
    include: ['src/**/*.test.ts', 'preview/**/*.test.ts', 'theme-tests/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
