import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const admin = { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' };

describe('admin dashboard', () => {
  it('shows all four required statistics, including the confirmed repeated label', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'p1', title: 'Recent note', content: 'Post', createdAt: '2026-04-01T00:00:00.000Z', authorId: 'u1', authorName: 'Mira' }]));
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'u1', username: 'mira', displayName: 'Mira', role: 'admin', createdAt: '2026-03-01T00:00:00.000Z' }]));
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Welcome, Admin' })).toBeInTheDocument();
    expect(screen.getByLabelText('Total Posts: 1')).toBeInTheDocument();
    expect(screen.getAllByText('Total Users')).toHaveLength(1);
    expect(screen.getByLabelText('Total Admins: 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Total users: 2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage Users' }).getAttribute('href')).toBe('/users');
    expect(screen.getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe('/edit/p1');
  });

  it('redirects guests from the dashboard to login', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<p>Login destination</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login destination')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Welcome,/ })).not.toBeInTheDocument();
  });

  it('redirects non-admin users from the dashboard to blogs', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-id', username: 'reader', displayName: 'Reader', role: 'user' }));
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/blogs" element={<p>Blogs destination</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Welcome,/ })).not.toBeInTheDocument();
  });

  it('does not delete a post when confirmation is cancelled and reports write failure', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'p1', title: 'Keep this', content: 'Post', createdAt: '2026-04-01T00:00:00.000Z', authorId: 'u1', authorName: 'Mira' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toHaveLength(1);
    cleanup();
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'p1', title: 'Keep this', content: 'Post', createdAt: '2026-04-01T00:00:00.000Z', authorId: 'u1', authorName: 'Mira' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('status')).toHaveTextContent('Could not save this change.');
  });
});
