import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WriteBlog from './WriteBlog.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const user = { userId: 'writer-1', username: 'mira', displayName: 'Mira Sol', role: 'user' };
const admin = { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' };
const otherPost = { id: 'other-post', title: 'Existing thought', content: 'Original writing', createdAt: '2026-02-01T00:00:00.000Z', authorId: 'someone-else', authorName: 'Niko Vale' };

function renderEditor(path, session = user, posts = []) {
  window.localStorage.setItem('writespace_posts', JSON.stringify(posts));
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/write" element={<WriteBlog />} /><Route path="/edit/:id" element={<WriteBlog />} /><Route path="/blogs" element={<h1>Blog list</h1>} /><Route path="/blog/:id" element={<h1>Saved post</h1>} /><Route path="/login" element={<h1>Login</h1>} /></Routes></MemoryRouter>);
}

describe('post authoring', () => {
  it('shows field-level errors and leaves storage unchanged when required fields are blank', () => {
    renderEditor('/write');
    fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByText('Enter a title.')).toBeTruthy();
    expect(screen.getByText('Enter some content.')).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
  });

  it('creates an attributed post and navigates to the saved post', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'created-id' });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-04T09:30:00.000Z'));
    renderEditor('/write', user);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  A new idea  ' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '  A few lines of writing.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByRole('heading', { name: 'Saved post' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([{ id: 'created-id', title: 'A new idea', content: 'A few lines of writing.', createdAt: '2026-04-04T09:30:00.000Z', authorId: 'writer-1', authorName: 'Mira Sol' }]);
  });

  it('updates an owned post while preserving its identity, author, and timestamp', () => {
    const owned = { ...otherPost, authorId: user.userId, authorName: user.displayName };
    renderEditor('/edit/other-post', user, [owned]);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Revised title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Revised content' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('heading', { name: 'Saved post' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))[0]).toEqual({ ...owned, title: 'Revised title', content: 'Revised content' });
  });

  it('blocks non-owners and permits an admin to edit another user post', () => {
    const { unmount } = renderEditor('/edit/other-post', user, [otherPost]);
    expect(screen.getByRole('heading', { name: 'Blog list' })).toBeTruthy();
    unmount();
    renderEditor('/edit/other-post', admin, [otherPost]);
    expect(screen.getByRole('heading', { name: 'Edit post' })).toBeTruthy();
  });

  it('reports failed storage writes without navigating away', () => {
    renderEditor('/write', user);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'A title' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'A story' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByRole('alert').textContent).toContain('Could not save this post.');
    expect(screen.getByRole('heading', { name: 'Write a new post' })).toBeTruthy();
  });
});
