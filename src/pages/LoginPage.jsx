import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, homeFor } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/**
 * Render the demo login form with an explicit local-storage security notice.
 * @returns {JSX.Element} Login screen.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const session = getSession();
  if (session) return <Navigate to={homeFor(session)} replace />;

  /** Submit credentials and navigate to the user's home page. */
  function handleSubmit(event) {
    event.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(homeFor(result.session), { replace: true });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-7 text-center text-2xl font-extrabold tracking-tight text-white">WriteSpace</Link>
        <section className="rounded-3xl bg-white p-7 shadow-2xl shadow-indigo-950/25 sm:p-9">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to read and write in your space.</p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-800">Username</label>
              <input id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:translate-y-px">Login</button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">New to WriteSpace? <Link to="/register" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Register</Link></p>
          <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
            Demo only: passwords are stored as plain text in this browser. Do not use a real password or sensitive information. Demo admin: <strong>admin / admin</strong>.
          </aside>
        </section>
      </div>
    </main>
  );
}
