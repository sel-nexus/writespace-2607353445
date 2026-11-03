import { expect, test } from '@playwright/test';

test('public page explains WriteSpace and presents guest routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Your thoughts. Your space. Beautifully simple.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login' }).first()).toHaveAttribute('href', '/login');
  await expect(page.getByRole('link', { name: 'Get Started' }).first()).toHaveAttribute('href', '/register');
  await expect(page.getByRole('heading', { name: 'Made for the act of writing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Latest from the Blog' })).toBeVisible();
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await expect(page.getByText(/not secure or private/i)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  expect(errors).toEqual([]);
});

test('mobile menu offers guest routes and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveAttribute('aria-label', 'Main navigation');
  await expect(page.getByRole('link', { name: 'Get Started', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Get Started', exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('a guest clicking a post preview is sent to login', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'story-1', title: 'A real local story', content: 'Preview text from storage.', createdAt: '2026-04-01T12:00:00.000Z', authorId: 'person', authorName: 'Mira Sol' }])));
  await page.goto('/');
  const preview = page.getByRole('link', { name: /A real local story/ });
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('Preview text from storage.');
  await preview.click();
  await expect(page).toHaveURL(/\/login$/);
});

test('authenticated public navbar directs a user to blogs and an admin to admin', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', username: 'reader', displayName: 'Mira Sol', role: 'user' })));
  await page.goto('/');
  await expect(page.getByText('Mira Sol')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/blogs');
  await page.evaluate(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' })));
  await page.reload();
  await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/admin');
});
