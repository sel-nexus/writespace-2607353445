import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<h1>Admin dashboard</h1>} />
        <Route path="/blogs" element={<h1>Blog list</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillCredentials(user, username, password) {
  await user.type(screen.getByLabelText('Username'), username);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
}

describe('login page', () => {
  it('shows an inline error for invalid credentials and stays on the form', async () => {
    const user = userEvent.setup();
    renderLogin();
    await fillCredentials(user, 'admin', 'incorrect');
    expect(screen.getByRole('alert').textContent).toBe('Invalid username or password.');
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeTruthy();
  });

  it('routes a successfully authenticated admin to the admin dashboard', async () => {
    const user = userEvent.setup();
    renderLogin();
    await fillCredentials(user, 'admin', 'admin');
    expect(screen.getByRole('heading', { name: 'Admin dashboard' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_session')).role).toBe('admin');
  });

  it('routes a registered user to the blog list after successful login', async () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([
      { id: 'user-1', displayName: 'Rae Reader', username: 'reader', password: 'secret', role: 'user' },
    ]));
    const user = userEvent.setup();
    renderLogin();
    await fillCredentials(user, 'reader', 'secret');
    expect(screen.getByRole('heading', { name: 'Blog list' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_session'))).toMatchObject({ userId: 'user-1', role: 'user' });
  });
});
