import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import UserManagement from './UserManagement.jsx';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const admin = { userId: 'admin-created', username: 'owner', displayName: 'Owner', role: 'admin' };
const current = { id: 'admin-created', username: 'owner', displayName: 'Owner', password: 'demo', role: 'admin', createdAt: '2026-03-01T00:00:00.000Z' };

function mount() {
  window.localStorage.setItem('writespace_session', JSON.stringify(admin));
  window.localStorage.setItem('writespace_users', JSON.stringify([current]));
  return render(<MemoryRouter><UserManagement /></MemoryRouter>);
}

describe('user management', () => {
  it('shows default and current account protections and validates required fields', () => {
    mount();
    expect(screen.getByTitle('Default admin cannot be deleted.')).toBeDisabled();
    expect(screen.getByTitle('You cannot delete your own account.')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter a display name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a username.')).toBeInTheDocument();
    expect(screen.getByText('Enter a password.')).toBeInTheDocument();
  });

  it('requires a display name when creating an account with username and password present', () => {
    mount();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-reader' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter a display name.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([current]);
  });

  it('requires a username when creating an account with display name and password present', () => {
    mount();
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'New Reader' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter a username.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([current]);
  });

  it('requires a password when creating an account with display name and username present', () => {
    mount();
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'New Reader' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-reader' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter a password.')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([current]);
  });

  it('preserves the account list and reports an error when saving a new account fails', () => {
    const other = { id: 'other-user', username: 'reader', displayName: 'Reader', password: 'demo', role: 'user', createdAt: '2026-02-01T00:00:00.000Z' };
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_users', JSON.stringify([current, other]));
    render(<MemoryRouter><UserManagement /></MemoryRouter>);
    const nativeSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'writespace_users') throw new Error('quota');
      return nativeSetItem.call(this, key, value);
    });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'New Reader' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-reader' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save this account. Check local storage settings and try again.');
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([current, other]);
    expect(screen.getByText('Reader')).toBeInTheDocument();
    expect(screen.queryByText('New Reader')).not.toBeInTheDocument();
  });

  it('creates a role-assigned account and rejects case-insensitive duplicates', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'new-admin-id' });
    mount();
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Niko Vale' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'niko' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo-pass' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByRole('status')).toHaveTextContent('Account created for Niko Vale.');
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))[1]).toMatchObject({ id: 'new-admin-id', username: 'niko', role: 'admin' });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Another' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'NIKO' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
  });

  it('cancels deletion without changes and preserves existing posts after confirmed deletion', () => {
    const other = { id: 'other-user', username: 'reader', displayName: 'Reader', password: 'demo', role: 'user', createdAt: '2026-02-01T00:00:00.000Z' };
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_users', JSON.stringify([current, other]));
    render(<MemoryRouter><UserManagement /></MemoryRouter>);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete', exact: true })[2]);
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toHaveLength(2);
    window.localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'old-post', title: 'Still here', content: 'Author retained', createdAt: '2026-01-01T00:00:00.000Z', authorId: 'other-user', authorName: 'Reader' }]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    cleanup();
    window.localStorage.setItem('writespace_session', JSON.stringify(admin));
    window.localStorage.setItem('writespace_users', JSON.stringify([current, other]));
    render(<MemoryRouter><UserManagement /></MemoryRouter>);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete', exact: true })[2]);
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([current]);
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))[0]).toMatchObject({ authorId: 'other-user', authorName: 'Reader' });
  });
});
