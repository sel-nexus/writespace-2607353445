import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const user = { userId: 'user-1', username: 'reader', role: 'user' };
const admin = { userId: 'writespace-admin', username: 'admin', role: 'admin' };

function renderRoutes(initialEntry, session, protectedOptions = {}) {
  window.localStorage.clear();
  if (session) window.localStorage.setItem('writespace_session', JSON.stringify(session));
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<h1>Login page</h1>} />
        <Route path="/blogs" element={<h1>Blog list</h1>} />
        <Route path="/admin" element={<h1>Admin dashboard</h1>} />
        <Route path="/private" element={<ProtectedRoute {...protectedOptions}><h1>Protected content</h1></ProtectedRoute>} />
        <Route path="/guest" element={<ProtectedRoute guestOnly><h1>Guest content</h1></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('protected routes', () => {
  it('redirects a guest from protected content to login', () => {
    renderRoutes('/private', null);
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Protected content' })).toBeNull();
  });

  it('redirects a non-admin user away from an admin-only route', () => {
    renderRoutes('/private', user, { adminOnly: true });
    expect(screen.getByRole('heading', { name: 'Blog list' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Protected content' })).toBeNull();
  });

  it('allows an admin to access admin-only content', () => {
    renderRoutes('/private', admin, { adminOnly: true });
    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeTruthy();
  });

  it('redirects an authenticated user away from a guest-only route to their home', () => {
    renderRoutes('/guest', user);
    expect(screen.getByRole('heading', { name: 'Blog list' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Guest content' })).toBeNull();
  });
});
