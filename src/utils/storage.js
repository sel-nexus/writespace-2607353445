/**
 * Read and write WriteSpace records in browser-local storage.
 *
 * Passwords are stored as plaintext because this is an explicitly insecure demonstration.
 * Never use real credentials or sensitive data in this application.
 */
const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/**
 * Retrieve an array from local storage, returning an empty array on read failure.
 * @param {string} key Local storage key to retrieve.
 * @returns {Array} Stored array, or an empty array when data is unavailable or malformed.
 */
function readArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Persist a value in local storage and report whether it succeeded.
 * @param {string} key Local storage key to write.
 * @param {*} value Serializable value to persist.
 * @returns {boolean} True when serialization and storage both succeed.
 */
function writeValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Read blog posts from browser-local storage.
 * @returns {Array<Object>} Stored posts, or an empty array when unavailable.
 */
export function getPosts() {
  return readArray(POSTS_KEY);
}

/**
 * Save blog posts to browser-local storage.
 * @param {Array<Object>} posts Posts to persist.
 * @returns {boolean} True when the posts were stored successfully.
 */
export function savePosts(posts) {
  return Array.isArray(posts) && writeValue(POSTS_KEY, posts);
}

/**
 * Read registered accounts from browser-local storage.
 * @returns {Array<Object>} Stored accounts, or an empty array when unavailable.
 */
export function getUsers() {
  return readArray(USERS_KEY);
}

/**
 * Save registered accounts to browser-local storage.
 * @param {Array<Object>} users Accounts to persist.
 * @returns {boolean} True when accounts were stored successfully.
 */
export function saveUsers(users) {
  return Array.isArray(users) && writeValue(USERS_KEY, users);
}

/**
 * Read the current session when it has the expected role and identity fields.
 * @returns {Object|null} Valid session or null when absent, malformed, or inaccessible.
 */
export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw === null) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object' || !session.userId || !session.username || !['admin', 'user'].includes(session.role)) return null;
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Persist the current session.
 * @param {Object} session Valid role-aware session object.
 * @returns {boolean} True when the session was stored successfully.
 */
export function setSession(session) {
  if (!session || typeof session !== 'object' || !session.userId || !session.username || !['admin', 'user'].includes(session.role)) return false;
  return writeValue(SESSION_KEY, session);
}

/**
 * Clear the active browser-local session.
 * @returns {boolean} True when the session was removed or was already absent.
 */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Read the seeded posts without changing stored state.
 * @returns {Array<Object>} Seed posts when the posts key is empty.
 */
export function getInitialPosts() {
  const existing = getPosts();
  if (existing.length > 0) return existing;
  const seed = [
    { id: 'welcome-to-writespace', title: 'A small space for your next idea', content: 'WriteSpace is a local-first blog demo. Try writing a post and see how it feels to make room for a thought.\n\nYour posts and demo account data stay in this browser only. This is not secure storage.', createdAt: '2026-03-01T12:00:00.000Z', authorId: 'writespace-admin', authorName: 'WriteSpace Admin' },
    { id: 'notes-on-noticing', title: 'Notes on noticing', content: 'A short walk can change the shape of a day. Pay attention to one ordinary detail, then write down what you saw.', createdAt: '2026-02-20T12:00:00.000Z', authorId: 'writespace-admin', authorName: 'WriteSpace Admin' },
    { id: 'the-first-draft', title: 'The first draft is a beginning', content: 'Start with the sentence you can write today. The rest can follow at its own pace.', createdAt: '2026-02-11T12:00:00.000Z', authorId: 'writespace-admin', authorName: 'WriteSpace Admin' },
  ];
  if (existing.length === 0) savePosts(seed);
  return seed;
}

/**
 * Sort posts newest first using creation timestamps.
 * @param {Array<Object>} posts Posts to sort.
 * @returns {Array<Object>} A sorted copy of the posts.
 */
export function newestFirst(posts) {
  return [...posts].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

/**
 * Format an ISO-like timestamp for post cards and details.
 * @param {string} timestamp Timestamp to format.
 * @returns {string} Date formatted as MMM DD, YYYY, or an accessible fallback.
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
}
