import { expect, test } from './support.js';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

test('capture accessibility, computed typography, and HTML for desktop and mobile', async ({ page }, testInfo) => {
  const captures = [];
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  captures.push({
    label: 'desktop-home',
    url: page.url(),
    accessibility: await page.locator('body').ariaSnapshot(),
    typography: await page.evaluate(() => ({
      bodyFont: getComputedStyle(document.body).fontFamily,
      headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
    })),
    html: await page.content(),
  });
  await page.screenshot({ path: testInfo.outputPath('desktop-home.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('button', { name: 'Menu' }).click();
  captures.push({
    label: 'mobile-home-menu-open',
    url: page.url(),
    accessibility: await page.locator('body').ariaSnapshot(),
    typography: await page.evaluate(() => ({
      bodyFont: getComputedStyle(document.body).fontFamily,
      headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
    })),
    html: await page.content(),
  });
  await page.screenshot({ path: testInfo.outputPath('mobile-menu-open.png'), fullPage: true });
  writeFileSync(path.join(testInfo.outputDir, 'ui-preflight.txt'), JSON.stringify(captures, null, 2));
  expect(captures).toHaveLength(2);
});
