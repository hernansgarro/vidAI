import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'measurement.mjs',workers:1,retries:0,timeout:720000,reporter:'list',use:{browserName:'chromium',headless:true}});
