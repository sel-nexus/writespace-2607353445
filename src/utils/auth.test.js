import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_ID, canDeleteUser, canManagePost, currentSession, homeFor, login, registerUser } from './auth.js';

describe('authentication and role rules', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('crypto', { randomUUID: () => 'new-user-id' });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T12:00:00.000Z'));
  });

  it('authenticates the fixed demo admin and routes to its dashboard', () => {
    const result = login('admin', 'admin');
    expect(result.ok).toBe(true);
    expect(result.session).toEqual({ userId: ADMIN_ID, username: 'admin', displayName: 'Admin', role: 'admin' });
    expect(currentSession()).toEqual(result.session);
    expect(homeFor(result.session)).toBe('/admin');
  });

  it('rejects wrong demo credentials and unknown users', () => {
    expect(login('admin', 'wrong')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(login('nobody', 'secret').ok).toBe(false);
  });

  it('requires every registration field and rejects mismatched passwords', () => {
    expect(registerUser({}).errors).toEqual({ displayName: 'Enter your display name.', username: 'Enter a username.', password: 'Enter a password.', confirmPassword: 'Confirm your password.' });
    expect(registerUser({ displayName: 'A', username: 'reader', password: 'a', confirmPassword: 'b' }).errors.confirmPassword).toBe('Passwords do not match.');
  });

  it('rejects the reserved admin name and duplicate usernames case-insensitively', () => {
    expect(registerUser({ displayName: 'A', username: 'ADMIN', password: 'p', confirmPassword: 'p' }).errors.username).toBe('That username is already taken.');
    expect(registerUser({ displayName: 'A', username: 'reader', password: 'p', confirmPassword: 'p' }).ok).toBe(true);
    expect(registerUser({ displayName: 'B', username: 'READER', password: 'p', confirmPassword: 'p' }).errors.username).toBe('That username is already taken.');
  });

  it('persists a user-role account and session after valid registration', () => {
    const result = registerUser({ displayName: 'A Reader', username: 'reader', password: 'demo', confirmPassword: 'demo' });
    expect(result.ok).toBe(true);
    expect(result.user).toEqual({ id: 'new-user-id', displayName: 'A Reader', username: 'reader', password: 'demo', role: 'user', createdAt: '2026-04-01T12:00:00.000Z' });
    expect(homeFor(result.session)).toBe('/blogs');
    expect(login('reader', 'demo').session.userId).toBe('new-user-id');
  });

  it('does not report successful login when session storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(login('admin', 'admin').ok).toBe(false);
  });

  it('enforces post and account ownership constraints', () => {
    const user = { userId: 'u1', username: 'u', role: 'user' };
    const post = { authorId: 'u1' };
    expect(canManagePost(user, post)).toBe(true);
    expect(canManagePost(user, { authorId: 'u2' })).toBe(false);
    expect(canManagePost({ role: 'admin' }, { authorId: 'u2' })).toBe(true);
    expect(canDeleteUser({ id: ADMIN_ID }, user)).toBe(false);
    expect(canDeleteUser({ id: 'u1' }, user)).toBe(false);
    expect(canDeleteUser({ id: 'u2' }, user)).toBe(true);
  });
});
