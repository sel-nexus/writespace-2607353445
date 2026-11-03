import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';
import { ADMIN_ID, canDeleteUser } from '../utils/auth.js';
import { getSession, getUsers, saveUsers } from '../utils/storage.js';

const emptyForm = { displayName: '', username: '', password: '', role: 'user' };

/**
 * Manage browser-local accounts with guarded deletion and role assignment.
 * @returns {JSX.Element} Admin account management screen.
 */
export default function UserManagement() {
  const session = getSession();
  const [users, setUsers] = useState(() => getUsers());
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/blogs" replace />;

  const accounts = [{ id: ADMIN_ID, displayName: 'Admin', username: 'admin', password: 'admin', role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' }, ...users];

  /** Update a form value and clear the related validation message. */
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  /** Validate and persist an admin-created account. */
  function createAccount(event) {
    event.preventDefault();
    const nextErrors = {};
    const displayName = form.displayName.trim();
    const username = form.username.trim();
    if (!displayName) nextErrors.displayName = 'Enter a display name.';
    if (!username) nextErrors.username = 'Enter a username.';
    if (!form.password) nextErrors.password = 'Enter a password.';
    if (username.toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === username.toLowerCase())) nextErrors.username = 'That username is already taken.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const newUser = { id: crypto.randomUUID(), displayName, username, password: form.password, role: form.role, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    if (!saveUsers(updated)) {
      setErrors({ form: 'Could not save this account. Check local storage settings and try again.' });
      return;
    }
    setUsers(updated);
    setForm(emptyForm);
    setErrors({});
    setMessage(`Account created for ${newUser.displayName}.`);
  }

  /** Confirm and delete an eligible account while preserving authored posts. */
  function deleteAccount(account) {
    if (!canDeleteUser(account, session) || !window.confirm(`Delete the account for ${account.displayName}? Existing posts and their author names will remain.`)) return;
    const updated = users.filter((user) => user.id !== account.id);
    if (!saveUsers(updated)) {
      setMessage('Could not save this change. Check local storage settings and try again.');
      return;
    }
    setUsers(updated);
    setMessage(`Account for ${account.displayName} deleted. Existing posts remain.`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/admin" className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline">Back to dashboard</Link>
        <div className="mt-5"><h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Manage Users</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">Create demo accounts and manage who can sign in on this browser.</p></div>
        <section aria-labelledby="create-account-title" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="create-account-title" className="text-2xl font-bold text-slate-900">Create User</h2>
          <form onSubmit={createAccount} noValidate className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div><label htmlFor="display-name" className="mb-2 block text-sm font-semibold">Display Name</label><input id="display-name" value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? 'display-name-error' : undefined} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />{errors.displayName && <p id="display-name-error" role="alert" className="mt-1 text-sm text-red-700">{errors.displayName}</p>}</div>
            <div><label htmlFor="new-username" className="mb-2 block text-sm font-semibold">Username</label><input id="new-username" value={form.username} onChange={(event) => updateField('username', event.target.value)} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'new-username-error' : undefined} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />{errors.username && <p id="new-username-error" role="alert" className="mt-1 text-sm text-red-700">{errors.username}</p>}</div>
            <div><label htmlFor="new-password" className="mb-2 block text-sm font-semibold">Password</label><input id="new-password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => updateField('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'new-password-error' : undefined} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />{errors.password && <p id="new-password-error" role="alert" className="mt-1 text-sm text-red-700">{errors.password}</p>}</div>
            <div><label htmlFor="new-role" className="mb-2 block text-sm font-semibold">Role</label><select id="new-role" value={form.role} onChange={(event) => updateField('role', event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30"><option value="user">User</option><option value="admin">Admin</option></select></div>
            {errors.form && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>}
            <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">Create account</button></div>
          </form>
        </section>
        {message && <p role="status" className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p>}
        <section aria-labelledby="accounts-title" className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-5"><h2 id="accounts-title" className="text-2xl font-bold text-slate-900">Accounts</h2><p className="mt-2 text-sm text-slate-600">The fixed demo admin cannot be removed. Deleting an account does not remove its posts.</p></div>
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] gap-5 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid"><span>Account</span><span>Role</span><span>Created</span><span>Access</span><span>Action</span></div>
          {accounts.map((account) => <UserRow key={account.id} account={account} currentUserId={session.userId} isDefault={account.id === ADMIN_ID} onDelete={deleteAccount} />)}
          {accounts.length === 0 && <p className="p-8 text-center text-slate-600">No accounts found.</p>}
        </section>
        <p className="mt-6 text-xs leading-5 text-slate-500">Demo only: account passwords are stored as plain text in browser storage. Never use real credentials or sensitive information.</p>
      </main>
    </div>
  );
}
