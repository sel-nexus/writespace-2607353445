import { expect, test } from './support.js';

const post = { id: 'admin-post', title: 'Admin review note', content: 'This post is available for review.', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'member', authorName: 'Mira Sol' };

async function openAdmin(page) {
  await page.addInitScript((storedPost) => {
    localStorage.setItem('writespace_posts', JSON.stringify([storedPost]));
    localStorage.setItem('writespace_users', JSON.stringify([{ id: 'member', username: 'mira', displayName: 'Mira Sol', password: 'demo', role: 'user', createdAt: '2026-02-01T00:00:00.000Z' }]));
  }, post);
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('admin sees statistics and recent post tools, then manages an account', async ({ page }) => {
  await openAdmin(page);
  await expect(page.getByRole('heading', { name: 'Welcome, Admin' })).toBeVisible();
  await expect(page.getByText('Total Posts')).toBeVisible();
  await expect(page.getByText('Total Users', { exact: true })).toBeVisible();
  await expect(page.getByText('Total Admins')).toBeVisible();
  await expect(page.getByText('Total users', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/edit/admin-post');
  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit post' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await expect(page).toHaveURL('/blogs');
  await page.getByRole('link', { name: 'Users', exact: true }).click();
  await page.getByLabel('Display Name').fill('Niko Vale');
  await page.getByLabel('Username').fill('niko');
  await page.getByLabel('Password').fill('demo-pass');
  await page.getByLabel('Role').selectOption('admin');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText('Account created for Niko Vale.');
  const users = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_users') || '[]'));
  expect(users.some((user: { username: string; role: string }) => user.username === 'niko' && user.role === 'admin')).toBe(true);
});

test('default and active account cannot be deleted; other account deletion is confirmed', async ({ page }) => {
  await openAdmin(page);
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page.getByTitle('Default admin cannot be deleted.')).toBeDisabled();
  await page.getByLabel('Display Name').fill('Niko Vale');
  await page.getByLabel('Username').fill('niko');
  await page.getByLabel('Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('status')).toContainText('Account created for Niko Vale.');
  const prompts: string[] = [];
  page.on('dialog', async (dialog) => { prompts.push(dialog.message()); await dialog.accept(); });
  const nikoRow = page.locator('div.grid').filter({ hasText: 'Niko Vale' }).last();
  await nikoRow.getByRole('button', { name: 'Delete' }).click();
  expect(prompts).toHaveLength(1);
  await expect(page.getByText('Account for Niko Vale deleted. Existing posts remain.')).toBeVisible();
  const remainingPosts = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]'));
  expect(remainingPosts).toContainEqual(post);
});

test('a non-admin visiting the admin-only users route is returned to blogs', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'member', username: 'mira', displayName: 'Mira', role: 'user' })));
  await page.goto('/users');
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
});

test('a guest visiting the admin route is sent to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
