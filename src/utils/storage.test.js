import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getPosts, getSession, getUsers, savePosts, saveUsers, setSession } from './storage.js';

describe('local storage helpers', () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('round trips posts, users, and a valid session', () => {
    const posts = [{ id: 'p1', title: 'A thought' }];
    const users = [{ id: 'u1', username: 'reader' }];
    const session = { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' };
    expect(savePosts(posts)).toBe(true);
    expect(saveUsers(users)).toBe(true);
    expect(setSession(session)).toBe(true);
    expect(getPosts()).toEqual(posts);
    expect(getUsers()).toEqual(users);
    expect(getSession()).toEqual(session);
  });

  it('returns empty arrays for malformed or non-array record values', () => {
    window.localStorage.setItem('writespace_posts', '{bad json');
    window.localStorage.setItem('writespace_users', JSON.stringify({ username: 'x' }));
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('returns safe defaults and reports failed writes when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
    expect(savePosts([{ id: 'p' }])).toBe(false);
    expect(saveUsers([{ id: 'u' }])).toBe(false);
    expect(setSession({ userId: 'u', username: 'u', role: 'user' })).toBe(false);
    expect(clearSession()).toBe(false);
  });

  it('rejects invalid values and invalid session structures', () => {
    expect(savePosts(null)).toBe(false);
    expect(saveUsers({})).toBe(false);
    expect(setSession({ userId: 'u', username: 'u', role: 'owner' })).toBe(false);
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u', username: 'u', role: 'owner' }));
    expect(getSession()).toBeNull();
  });
});
