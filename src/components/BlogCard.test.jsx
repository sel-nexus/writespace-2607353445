import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogCard from './BlogCard.jsx';

afterEach(cleanup);

const post = { id: 'post-1', title: 'A careful title', content: 'x'.repeat(121), createdAt: '2026-04-02T00:00:00.000Z', authorId: 'owner', authorName: 'Mira Sol' };

describe('blog card', () => {
  it('shows the excerpt, date, author avatar and a post detail link', () => {
    render(<MemoryRouter><BlogCard post={post} index={0} session={{ userId: 'reader', role: 'user' }} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'A careful title' })).toBeTruthy();
    expect(screen.getByText('Apr 02, 2026')).toBeTruthy();
    expect(screen.getByText('Mira Sol')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'User avatar' })).toBeTruthy();
    const detailLinks = screen.getAllByRole('link', { name: /A careful title|Mira Sol/ });
    expect(detailLinks.every((link) => link.getAttribute('href') === '/blog/post-1')).toBe(true);
    expect(screen.getByText('x'.repeat(120))).toBeTruthy();
    expect(screen.queryByText('x'.repeat(121))).toBeNull();
  });

  it('shows edit/delete only for an owner or admin', () => {
    const { rerender } = render(<MemoryRouter><BlogCard post={post} index={2} session={{ userId: 'reader', role: 'user' }} onDelete={() => {}} /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
    rerender(<MemoryRouter><BlogCard post={post} index={2} session={{ userId: 'owner', role: 'user' }} onDelete={() => {}} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe('/edit/post-1');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });
});
