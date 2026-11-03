import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getSession } from '../utils/storage.js';
import { getPosts, savePosts, newestFirst } from '../utils/storage.js';

/**
 * Render the authenticated newest-first post index and safe empty state.
 * @returns {JSX.Element} Blog index for the current member.
 */
export default function Home() {
  const session = getSession();
  const [posts, setPosts] = useState(() => newestFirst(getPosts()));
  const [message, setMessage] = useState('');
  if (!session) return <Navigate to="/login" replace />;

  /** Remove an authorized post after confirmation and persist the change. */
  function deletePost(post) {
    if (!window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) return;
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
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Your reading space</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">All Blogs</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Read the newest posts, or add a thought of your own.</p>
          </div>
          <Link to="/write" className="rounded-full bg-indigo-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">Write a post</Link>
        </div>
        {message && <p role="status" className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p>}
        {posts.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No blogs yet. Be the first to write one!</h2>
            <p className="mt-3 text-slate-600">Start with a title and a few lines. You can edit it later.</p>
            <Link to="/write" className="mt-7 inline-flex rounded-full bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Write your first post</Link>
          </section>
        ) : (
          <section aria-label="All blog posts" className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => <BlogCard key={post.id} post={post} index={index} session={session} onDelete={deletePost} />)}
          </section>
        )}
        <p className="mt-8 text-xs leading-5 text-slate-500">Demo content is kept in browser storage only. This app does not provide secure account or content protection.</p>
      </main>
    </div>
  );
}

