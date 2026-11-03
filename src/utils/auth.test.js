import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_ID, canDeleteUser, canManagePost, currentSession, homeFor, login, registerUser } from './auth.js';

describe('authentication and role rules', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('reports a missing display name when the other registration fields are provided', () => {
    const result = registerUser({ username: 'reader', password: 'demo', confirmPassword: 'demo' });
    expect(result).toEqual({ ok: false, errors: { displayName: 'Enter your display name.' } });
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('reports a missing username when the other registration fields are provided', () => {
    const result = registerUser({ displayName: 'A Reader', password: 'demo', confirmPassword: 'demo' });
    expect(result).toEqual({ ok: false, errors: { username: 'Enter a username.' } });
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('reports a missing password when the other registration fields are provided', () => {
    const result = registerUser({ displayName: 'A Reader', username: 'reader', confirmPassword: 'demo' });
    expect(result).toEqual({ ok: false, errors: { password: 'Enter a password.' } });
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('reports a missing password confirmation when the other registration fields are provided', () => {
    const result = registerUser({ displayName: 'A Reader', username: 'reader', password: 'demo' });
    expect(result).toEqual({ ok: false, errors: { confirmPassword: 'Confirm your password.' } });
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('rejects the reserved admin name and duplicate usernames case-insensitively', () => {
    expect(registerUser({ displayName: 'A', username: 'ADMIN', password: 'p', confirmPassword: 'p' }).errors.username).toBe('That username is already taken.');
    expect(registerUser({ displayName: 'A', username: 'reader', password: 'p', confirmPassword: 'p' }).ok).toBe(true);
    expect(registerUser({ displayName: 'B', username: 'READER', password: 'p', confirmPassword: 'p' }).errors.username).toBe('That username is already taken.');
  });

  it('rejects display names and usernames containing only whitespace', () => {
    const result = registerUser({ displayName: '  \t ', username: ' \n ', password: 'demo', confirmPassword: 'demo' });
    expect(result).toEqual({ ok: false, errors: { displayName: 'Enter your display name.', username: 'Enter a username.' } });
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
  });

  it('persists a user-role account and session after valid registration', () => {
    const result = registerUser({ displayName: 'A Reader', username: 'reader', password: 'demo', confirmPassword: 'demo' });
    expect(result.ok).toBe(true);
    expect(result.user).toEqual({ id: 'new-user-id', displayName: 'A Reader', username: 'reader', password: 'demo', role: 'user', createdAt: '2026-04-01T12:00:00.000Z' });
    expect(homeFor(result.session)).toBe('/blogs');
    expect(login('reader', 'demo').session.userId).toBe('new-user-id');
  });

  it('returns a storage error and leaves users unchanged when saving a new account fails', () => {
    const existingUsers = [{ id: 'existing', displayName: 'Existing', username: 'existing', password: 'secret', role: 'user' }];
    window.localStorage.setItem('writespace_users', JSON.stringify(existingUsers));
    const nativeSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'writespace_users') throw new Error('quota');
      return nativeSetItem.call(this, key, value);
    });

    const result = registerUser({ displayName: 'New Reader', username: 'new-reader', password: 'demo', confirmPassword: 'demo' });

    expect(result).toEqual({ ok: false, errors: { form: 'Unable to save your account. Check local storage settings.' } });
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual(existingUsers);
    expect(window.localStorage.getItem('writespace_session')).toBeNull();
  });

  it('rolls back the new account when saving its session fails', () => {
    const existingUsers = [{ id: 'existing', displayName: 'Existing', username: 'existing', password: 'secret', role: 'user' }];
    window.localStorage.setItem('writespace_users', JSON.stringify(existingUsers));
    const nativeSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'writespace_session') throw new Error('quota');
      return nativeSetItem.call(this, key, value);
    });

    const result = registerUser({ displayName: 'New Reader', username: 'new-reader', password: 'demo', confirmPassword: 'demo' });

    expect(result).toEqual({ ok: false, errors: { form: 'Unable to save this browser session. Your account was not created.' } });
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual(existingUsers);
    expect(window.localStorage.getItem('writespace_session')).toBeNull();
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
