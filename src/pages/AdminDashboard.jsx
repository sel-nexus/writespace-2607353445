import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { getSession } from '../utils/storage.js';
import { formatDate, getPosts, getUsers, savePosts, newestFirst } from '../utils/storage.js';
import { canManagePost } from '../utils/auth.js';

const ADMIN_ID = 'writespace-admin';
const TONES = ['indigo', 'violet', 'pink', 'teal'];

/**
 * Render the administrator overview with statistics and recent post actions.
 * @returns {JSX.Element} Admin dashboard.
 */
export default function AdminDashboard() {
  const session = getSession();
  const [posts, setPosts] = useState(() => newestFirst(getPosts()));
  const [message, setMessage] = useState('');
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/blogs" replace />;

  const users = getUsers();
  const totalUsers = users.length + 1;
  const totalAdmins = users.filter((user) => user.role === 'admin').length + 1;
  const stats = [
    { label: 'Total Posts', value: posts.length },
    { label: 'Total Users', value: totalUsers },
    { label: 'Total Admins', value: totalAdmins },
    { label: 'Total users', value: totalUsers },
  ];

  /** Remove a post from browser storage after administrator confirmation. */
  function deletePost(post) {
    if (!canManagePost(session, post) || !window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
    const updated = posts.filter((item) => item.id !== post.id);
    if (!savePosts(updated)) {
      setMessage('Could not save this change. Check local storage settings and try again.');
      return;
    }
    setPosts(updated);
    setMessage('Post deleted.');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-8 text-white shadow-lg shadow-indigo-950/15 sm:px-9 sm:py-10">
          <p className="text-sm font-semibold text-indigo-100">WriteSpace overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {session.displayName}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-indigo-50">Review the latest writing and manage accounts in this browser-local demonstration.</p>
        </section>
        <section aria-label="Blog statistics" className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => <StatCard key={`${stat.label}-${index}`} label={stat.label} value={stat.value} tone={TONES[index]} />)}
        </section>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/write" className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Write New Post</Link>
          <Link to="/users" className="rounded-lg border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">Manage Users</Link>
        </div>
        {message && <p role="status" className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p>}
        <section aria-labelledby="recent-posts-title" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h2 id="recent-posts-title" className="text-2xl font-bold text-slate-900">Recent posts</h2><p className="mt-2 text-slate-600">The five most recently updated entries.</p></div>
            <Link to="/blogs" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">View all posts</Link>
          </div>
          {posts.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">No posts yet. Start with a new post.</p> : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {posts.slice(0, 5).map((post) => (
                <article key={post.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
                  <div className="min-w-0"><Link to={`/blog/${encodeURIComponent(post.id)}`} className="font-semibold text-slate-900 hover:text-indigo-800">{post.title}</Link><p className="mt-1 text-sm text-slate-500">By {post.authorName} · {formatDate(post.createdAt)}</p></div>
                  <div className="flex gap-2">{canManagePost(session, post) && <Link to={`/edit/${encodeURIComponent(post.id)}`} className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Edit</Link>}<button type="button" onClick={() => deletePost(post)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Delete</button></div>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-8 text-xs leading-5 text-slate-500">Local demo only. Role checks are client-side and do not provide security.</p>
      </main>
    </div>
  );
}
