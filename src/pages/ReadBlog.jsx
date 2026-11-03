import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { canManagePost } from '../utils/auth.js';
import { formatDate, getPosts, getSession, savePosts } from '../utils/storage.js';

/**
 * Show a post detail to signed-in readers and route guests to login.
 * @returns {JSX.Element} Full post or a clear missing-post state.
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState('');
  const session = getSession();
  const post = getPosts().find((item) => item.id === id);
  if (!session) return <Navigate to="/login" replace state={{ from: `/blog/${encodeURIComponent(id ?? '')}` }} />;

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar session={session} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Post not found</h1>
          <p className="mt-3 text-slate-600">This post may have been removed or its link may be out of date.</p>
          <Link to="/blogs" className="mt-7 inline-flex rounded-full bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Back to All Posts</Link>
        </main>
      </div>
    );
  }

  const canEdit = canManagePost(session, post);

  /**
   * Confirm and remove this post from browser storage.
   * @returns {void} Navigates away only after the removal is saved.
   */
  function handleDelete() {
    if (!window.confirm('Delete this post? This action cannot be undone.')) return;

    const remainingPosts = getPosts().filter((item) => item.id !== post.id);
    if (!savePosts(remainingPosts)) {
      setDeleteError('Unable to delete this post. Check local storage settings and try again.');
      return;
    }

    navigate('/blogs');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link to="/blogs" className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline">← Back to All Posts</Link>
        <article className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-sm text-slate-600">By <strong className="text-slate-800">{post.authorName}</strong></p>
          <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8 text-slate-700">{post.content}</div>
          <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {canEdit && <Link to={`/edit/${encodeURIComponent(post.id)}`} className="rounded-lg border border-indigo-200 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-50">Edit post</Link>}
            {canEdit && <button type="button" onClick={handleDelete} className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50">Delete</button>}
            <Link to="/blogs" className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100">Back to All Posts</Link>
          </div>
          {deleteError && <p role="alert" className="mt-4 text-sm font-medium text-red-700">{deleteError}</p>}
        </article>
      </main>
    </div>
  );
}
