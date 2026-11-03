import { expect, test } from '@playwright/test';

const seed = { id: 'mine', title: 'My first thought', content: 'First version.', createdAt: '2026-03-01T12:00:00.000Z', authorId: 'writer-1', authorName: 'Mira Sol' };

async function openAsUser(page) {
  await page.addInitScript((post) => {
    localStorage.setItem('writespace_posts', JSON.stringify([post]));
    localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writer-1', username: 'mira', displayName: 'Mira Sol', role: 'user' }));
  }, seed);
  await page.goto('/write');
}

test('signed-in writer validates and creates a post visible after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await openAsUser(page);
  await page.getByRole('button', { name: 'Publish post' }).click();
  await expect(page.getByText('Enter a title.')).toBeVisible();
  await expect(page.getByText('Enter some content.')).toBeVisible();
  await page.getByLabel('Title').fill('A thought worth keeping');
  await page.getByLabel('Content').fill('One clear sentence.\n\nAnd another.');
  await page.getByRole('button', { name: 'Publish post' }).click();
  await expect(page.getByRole('heading', { name: 'A thought worth keeping' })).toBeVisible();
  await expect(page.getByText('One clear sentence.\n\nAnd another.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A thought worth keeping' })).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]'));
  const created = stored.find((post: { title: string }) => post.title === 'A thought worth keeping');
  expect(created.authorId).toBe('writer-1');
  expect(created.authorName).toBe('Mira Sol');
  expect(created.id).toBeTruthy();
  expect(errors).toEqual([]);
});

test('owner edits existing post and cancel does not save a later draft', async ({ page }) => {
  await openAsUser(page);
  await page.goto('/edit/mine');
  await page.getByLabel('Title').fill('Revised thought');
  await page.getByLabel('Content').fill('Updated body.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Revised thought' })).toBeVisible();
  await page.goto('/write');
  await page.getByLabel('Title').fill('Unsaved draft');
  await page.getByLabel('Content').fill('Cancel should discard this.');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]'));
  expect(stored.some((post: { title: string }) => post.title === 'Unsaved draft')).toBe(false);
});

test('non-owner cannot edit another user post while admin can', async ({ page }) => {
  await page.addInitScript((post) => {
    localStorage.setItem('writespace_posts', JSON.stringify([post]));
    localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader', username: 'reader', displayName: 'Reader', role: 'user' }));
  }, { ...seed, authorId: 'someone-else', authorName: 'Niko Vale' });
  await page.goto('/edit/mine');
  await expect(page).toHaveURL(/\/blogs$/);
  await page.evaluate(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' })));
  await page.goto('/edit/mine');
  await expect(page.getByRole('heading', { name: 'Edit post' })).toBeVisible();
});
