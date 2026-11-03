import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReadBlog from './ReadBlog.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const post = { id: 'story-1', title: 'A local story', content: 'First line\n\nSecond line', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'writer', authorName: 'Mira Sol' };
function renderAt(path, session) {
  window.localStorage.setItem('writespace_posts', JSON.stringify([post]));
  if (session) window.localStorage.setItem('writespace_session', JSON.stringify(session));
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/blog/:id" element={<ReadBlog />} /><Route path="/login" element={<h1>Login destination</h1>} /></Routes></MemoryRouter>);
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

  it('shows a missing-post state and lets an admin edit any post', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' }));
    render(<MemoryRouter initialEntries={['/blog/missing']}><Routes><Route path="/blog/:id" element={<ReadBlog />} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeTruthy();
    cleanup();
    renderAt('/blog/story-1', { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' });
    expect(screen.getByRole('link', { name: 'Edit post' }).getAttribute('href')).toBe('/edit/story-1');
  });
});
