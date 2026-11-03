import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await use(page);
    await page.screenshot({ path: testInfo.outputPath('journey.png'), fullPage: true });
    expect(errors, `Browser errors: ${errors.join(' | ')}`).toEqual([]);
  },
});

export { expect };
