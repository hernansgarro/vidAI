import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'measurement.ts',workers:1,retries:0,timeout:1080000,reporter:'list',use:{browserName:'chromium',headless:true}});
