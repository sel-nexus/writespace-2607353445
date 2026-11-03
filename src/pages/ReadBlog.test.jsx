import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReadBlog from './ReadBlog.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

const post = { id: 'story-1', title: 'A local story', content: 'First line\n\nSecond line', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'writer', authorName: 'Mira Sol' };
function renderAt(path, session, storedPost = post) {
  window.localStorage.setItem('writespace_posts', JSON.stringify([storedPost]));
  if (session) window.localStorage.setItem('writespace_session', JSON.stringify(session));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:id" element={<ReadBlog />} />
        <Route path="/login" element={<h1>Login destination</h1>} />
        <Route path="/blogs" element={<h1>All blog posts</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('post reading', () => {
  it('redirects a guest to login and carries the intended post route', () => {
    renderAt('/blog/story-1', null);
    expect(screen.getByRole('heading', { name: 'Login destination' })).toBeTruthy();
  });

  it('shows the full text with preserved line breaks, author and date', () => {
    renderAt('/blog/story-1', { userId: 'reader', username: 'reader', displayName: 'Reader', role: 'user' });
    expect(screen.getByRole('heading', { name: 'A local story' })).toBeTruthy();
    expect(screen.getByText((content) => content.includes('First line') && content.includes('Second line'))).toBeTruthy();
    expect(screen.getByText('Mira Sol')).toBeTruthy();
    expect(screen.getByText('Mar 04, 2026')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Edit post' })).toBeNull();
  });

  it('renders markup-like title and content as visible text without creating elements', () => {
    const title = '<img src=x onerror="alert(1)">';
    const content = '<script>alert("xss")</script>';
    const markupLikePost = { ...post, title, content };

    const { container } = renderAt('/blog/story-1', { userId: 'reader', username: 'reader', displayName: 'Reader', role: 'user' }, markupLikePost);

    expect(screen.getByRole('heading', { name: title }).textContent).toBe(title);
    expect(screen.getByText(content).textContent).toBe(content);
    expect(container.querySelector('img, script')).toBeNull();
  });

  it('shows a missing-post state and lets an admin edit any post', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' }));
    render(<MemoryRouter initialEntries={['/blog/missing']}><Routes><Route path="/blog/:id" element={<ReadBlog />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeTruthy();
    cleanup();
    renderAt('/blog/story-1', { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' });
    expect(screen.getByRole('link', { name: 'Edit post' }).getAttribute('href')).toBe('/edit/story-1');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });

  it('lets the owner confirm deletion, persists removal and returns to the post list', () => {
    renderAt('/blog/story-1', { userId: 'writer', username: 'writer', displayName: 'Mira Sol', role: 'user' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(window.confirm).toHaveBeenCalledWith('Delete this post? This action cannot be undone.');
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
    expect(screen.getByRole('heading', { name: 'All blog posts' })).toBeTruthy();
  });

  it('does not allow a non-owner to delete a post', () => {
    renderAt('/blog/story-1', { userId: 'reader', username: 'reader', displayName: 'Reader', role: 'user' });

    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
  });

  it('lets an admin delete another user post', () => {
    renderAt('/blog/story-1', { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
    expect(screen.getByRole('heading', { name: 'All blog posts' })).toBeTruthy();
  });

  it('preserves storage and stays on the detail when deletion is cancelled', () => {
    renderAt('/blog/story-1', { userId: 'writer', username: 'writer', displayName: 'Mira Sol', role: 'user' });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
    expect(screen.getByRole('heading', { name: 'A local story' })).toBeTruthy();
  });

  it('keeps the detail visible and shows an error when saving the deletion fails', () => {
    renderAt('/blog/story-1', { userId: 'writer', username: 'writer', displayName: 'Mira Sol', role: 'user' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage full'); });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([post]);
    expect(screen.getByRole('heading', { name: 'A local story' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/Unable to delete this post/);
    setItem.mockRestore();
  });
});
