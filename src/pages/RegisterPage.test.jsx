import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/blogs" element={<h1>Blog list</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('registration page', () => {
  it('shows field validation for missing values without creating an account', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter your display name.')).toBeTruthy();
    expect(screen.getByText('Enter a username.')).toBeTruthy();
    expect(screen.getByText('Enter a password.')).toBeTruthy();
    expect(screen.getByText('Confirm your password.')).toBeTruthy();
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('shows password mismatch validation and does not register the account', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText('Display Name'), 'Rae Reader');
    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('creates a user account and routes to the blog list after valid registration', async () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'created-user' });
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText('Display Name'), 'Rae Reader');
    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByRole('heading', { name: 'Blog list' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toMatchObject([
      { id: 'created-user', displayName: 'Rae Reader', username: 'reader', role: 'user' },
    ]);
    expect(JSON.parse(window.localStorage.getItem('writespace_session'))).toMatchObject({ userId: 'created-user', role: 'user' });
  });
});
