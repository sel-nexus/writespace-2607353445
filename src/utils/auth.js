import { getSession, getUsers, saveUsers, setSession } from './storage.js';

export const ADMIN_ID = 'writespace-admin';
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin';

/**
 * Return the authenticated role's home route.
 * @param {Object|null} session Current session.
 * @returns {string} Role-appropriate home route.
 */
export function homeFor(session) {
  return session?.role === 'admin' ? '/admin' : '/blogs';
}

/**
 * Authenticate the hard-coded demo admin or an existing local account.
 * @param {string} username Submitted username.
 * @param {string} password Submitted plaintext demo password.
 * @returns {{ok: boolean, session?: Object, error?: string}} Authentication result.
 */
export function login(username, password) {
  const normalized = String(username ?? '').trim().toLowerCase();
  if (normalized === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = { userId: ADMIN_ID, username: ADMIN_USERNAME, displayName: 'Admin', role: 'admin' };
    return setSession(session) ? { ok: true, session } : { ok: false, error: 'Unable to save this browser session. Check local storage settings.' };
  }
  const account = getUsers().find((user) => String(user.username).toLowerCase() === normalized && user.password === password);
  if (!account) return { ok: false, error: 'Invalid username or password.' };
  const session = { userId: account.id, username: account.username, displayName: account.displayName, role: account.role };
  return setSession(session) ? { ok: true, session } : { ok: false, error: 'Unable to save this browser session. Check local storage settings.' };
}

/**
 * Validate and persist a new user account.
 * @param {Object} input Account fields from a registration form.
 * @returns {{ok: boolean, user?: Object, session?: Object, errors?: Object}} Registration result.
 */
export function registerUser(input) {
  const displayName = String(input.displayName ?? '').trim();
  const username = String(input.username ?? '').trim();
  const password = String(input.password ?? '');
  const confirmPassword = String(input.confirmPassword ?? '');
  const errors = {};
  if (!displayName) errors.displayName = 'Enter your display name.';
  if (!username) errors.username = 'Enter a username.';
  if (!password) errors.password = 'Enter a password.';
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  if (password && confirmPassword && password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (username.toLowerCase() === ADMIN_USERNAME || getUsers().some((user) => String(user.username).toLowerCase() === username.toLowerCase())) errors.username = 'That username is already taken.';
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const user = { id: crypto.randomUUID(), displayName, username, password, role: 'user', createdAt: new Date().toISOString() };
  const users = getUsers();
  if (!saveUsers([...users, user])) return { ok: false, errors: { form: 'Unable to save your account. Check local storage settings.' } };
  const session = { userId: user.id, username: user.username, displayName: user.displayName, role: user.role };
  if (!setSession(session)) {
    saveUsers(users);
    return { ok: false, errors: { form: 'Unable to save this browser session. Your account was not created.' } };
  }
  return { ok: true, user, session };
}

/**
 * Return the current valid session from browser storage.
 * @returns {Object|null} Current session or null.
 */
export function currentSession() {
  return getSession();
}

/**
 * Check whether a user can modify a post.
 * @param {Object|null} session Current session.
 * @param {Object} post Post to modify.
 * @returns {boolean} True for an admin or the owning user.
 */
export function canManagePost(session, post) {
  return Boolean(session && post && (session.role === 'admin' || session.userId === post.authorId));
}

/**
 * Check whether the current account can be deleted.
 * @param {Object} account Account to delete.
 * @param {Object|null} session Current session.
 * @returns {boolean} False for the hard-coded admin or active account.
 */
export function canDeleteUser(account, session) {
  return Boolean(account && account.id !== ADMIN_ID && account.id !== session?.userId);
}
