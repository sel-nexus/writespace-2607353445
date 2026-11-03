import { expect, test } from '@playwright/test';

const posts = [
  { id: 'older', title: 'A note from last week', content: 'An earlier thought.', createdAt: '2026-02-01T00:00:00.000Z', authorId: 'owner', authorName: 'Mira Sol' },
  { id: 'newer', title: 'A thought from today', content: 'First line\n\nSecond line in the full post.', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'owner', authorName: 'Mira Sol' },
  { id: 'others', title: 'Another writer’s note', content: 'This belongs to another author.', createdAt: '2026-03-03T12:00:00.000Z', authorId: 'other', authorName: 'Niko Vale' },
];

async function signInUser(page) {
  await page.addInitScript((items) => {
    localStorage.setItem('writespace_posts', JSON.stringify(items));
    localStorage.setItem('writespace_users', JSON.stringify([{ id: 'owner', displayName: 'Mira Sol', username: 'mira', password: 'demo-pass', role: 'user', createdAt: '2026-02-01T00:00:00.000Z' }]));
  }, posts);
  await page.goto('/login');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
}

test('member sees newest-first posts and can read the whole post with preserved newlines', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await signInUser(page);
  const titles = await page.locator('section[aria-label="All blog posts"] h2').allTextContents();
  expect(titles).toEqual(['A thought from today', 'Another writer’s note', 'A note from last week']);
  await page.getByRole('link', { name: /A thought from today/ }).click();
  await expect(page.getByText('First line\n\nSecond line in the full post.')).toBeVisible();
  await expect(page.getByText('Mira Sol')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit post' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('member cannot edit or delete another author post; guest detail is protected', async ({ page }) => {
  await signInUser(page);
  await page.getByRole('link', { name: /Another writer’s note/ }).click();
  await expect(page.getByRole('heading', { name: 'Another writer’s note' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit post' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  await page.evaluate(() => localStorage.removeItem('writespace_session'));
  await page.goto('/blog/newer');
  await expect(page).toHaveURL(/\/login$/);
});

test('confirmed delete removes an owned post, cancellation preserves it, and logout clears session', async ({ page }) => {
  await signInUser(page);
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'A thought from today' })).toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]'));
  expect(stored.map((item: { id: string }) => item.id)).toEqual(['older', 'others']);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => localStorage.getItem('writespace_session'))).toBeNull();
});
