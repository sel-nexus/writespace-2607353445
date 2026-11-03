import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const session = { userId: 'user-1', username: 'reader', displayName: 'Rae Reader', role: 'user' };
const posts = [
  { id: 'older', title: 'Older thought', content: 'Older words', createdAt: '2026-04-01T00:00:00.000Z', authorId: 'user-1', authorName: 'Rae Reader' },
  { id: 'newer', title: 'Newer thought', content: 'Newer words', createdAt: '2026-04-02T00:00:00.000Z', authorId: 'user-1', authorName: 'Rae Reader' },
];

function renderHome(storedPosts = []) {
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
  window.localStorage.setItem('writespace_posts', JSON.stringify(storedPosts));
  return render(<MemoryRouter><Home /></MemoryRouter>);
}

describe('blog index', () => {
  it('shows the empty state and a link to write the first post', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Write your first post' }).getAttribute('href')).toBe('/write');
  });

  it('lists posts newest first with links to their saved pages', () => {
    renderHome(posts);
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(['Newer thought', 'Older thought']);
    expect(screen.getByRole('link', { name: /Newer thought/ }).getAttribute('href')).toBe('/blog/newer');
    expect(screen.getByRole('link', { name: /Older thought/ }).getAttribute('href')).toBe('/blog/older');
  });

  it('keeps the post visible and storage unchanged when deletion is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHome([posts[0]]);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('heading', { name: 'Older thought' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([posts[0]]);
  });

  it('removes a confirmed post from the page and persists the remaining posts', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderHome(posts);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    expect(screen.queryByRole('heading', { name: 'Newer thought' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Older thought' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Post deleted.');
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([posts[0]]);
  });

  it('shows a storage error and preserves the post when deletion cannot be saved', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderHome([posts[0]]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('heading', { name: 'Older thought' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Could not save this change. Check local storage settings and try again.');
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([posts[0]]);
  });
});
