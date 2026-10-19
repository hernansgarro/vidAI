import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {baseURL: 'http://127.0.0.1:4173/vidAI/', browserName: 'chromium'},
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/vidAI/',
    reuseExistingServer: !process.env.CI,
  },
});
