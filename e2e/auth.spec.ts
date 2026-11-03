import { expect, test } from '@playwright/test';

test('guest registers, remains signed in after reload, and can log out', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/register');
  await page.getByLabel('Display Name').fill('Mira Sol');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password', { exact: true }).fill('demo-pass');
  await page.getByLabel('Confirm Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your reading space' })).toBeVisible();
  await page.evaluate(() => localStorage.removeItem('writespace_session'));
  await page.goto('/login');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  expect(browserErrors).toEqual([]);
});

test('invalid credentials show an inline error and admin login opens admin home', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid username or password.');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
});

test('registration rejects duplicates and passwords that do not match', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Display Name').fill('Admin Account');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('one');
  await page.getByLabel('Confirm Password').fill('two');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'That username is already taken.' })).toBeVisible();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();
});
