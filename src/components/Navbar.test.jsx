import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const user = { userId: 'user-1', username: 'reader', displayName: 'Rae Reader', role: 'user' };
const admin = { userId: 'writespace-admin', username: 'admin', displayName: 'Admin', role: 'admin' };

function renderNavbar(session) {
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
  return render(
    <MemoryRouter initialEntries={['/blogs']}>
      <Routes>
        <Route path="/blogs" element={<Navbar session={session} />} />
        <Route path="/" element={<h1>Public home</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('authenticated navigation', () => {
  it('shows common user navigation but not the admin-only Users link', () => {
    renderNavbar(user);
    expect(screen.getByRole('link', { name: 'All Blogs' }).getAttribute('href')).toBe('/blogs');
    expect(screen.getByRole('link', { name: 'Write' }).getAttribute('href')).toBe('/write');
    expect(screen.queryByRole('link', { name: 'Users' })).toBeNull();
    expect(screen.getByText('Rae Reader')).toBeTruthy();
  });

  it('shows the admin-only Users destination for admins', () => {
    renderNavbar(admin);
    expect(screen.getByRole('link', { name: 'Users' }).getAttribute('href')).toBe('/users');
    expect(screen.getByRole('link', { name: 'All Blogs' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Write' })).toBeTruthy();
  });

  it('clears the browser session and navigates to public home on logout', async () => {
    const userActions = userEvent.setup();
    renderNavbar(user);
    await userActions.click(screen.getByRole('button', { name: 'Logout' }));
    expect(window.localStorage.getItem('writespace_session')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Public home' })).toBeTruthy();
  });
});
