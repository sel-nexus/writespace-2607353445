import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { canManagePost } from '../utils/auth.js';
import { getPosts, getSession, savePosts } from '../utils/storage.js';

/**
 * Render a validated post editor for creation or an authorized edit.
 * @returns {JSX.Element} New-post or edit-post form.
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const posts = getPosts();
  const existingPost = id ? posts.find((item) => item.id === id) : null;
  const [title, setTitle] = useState(existingPost?.title ?? '');
  const [content, setContent] = useState(existingPost?.content ?? '');
  const [errors, setErrors] = useState({});

  if (!session) return <Navigate to="/login" replace />;
  if (id && (!existingPost || !canManagePost(session, existingPost))) return <Navigate to="/blogs" replace />;

  /** Validate the fields, persist the post, and open its reading view. */
  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Enter a title.';
    if (!content.trim()) nextErrors.content = 'Enter some content.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const updatedPost = existingPost
      ? { ...existingPost, title: title.trim(), content: content.trim() }
      : { id: crypto.randomUUID(), title: title.trim(), content: content.trim(), createdAt: new Date().toISOString(), authorId: session.userId, authorName: session.displayName };
    const nextPosts = existingPost
      ? posts.map((post) => post.id === existingPost.id ? updatedPost : post)
      : [updatedPost, ...posts];
    if (!savePosts(nextPosts)) {
      setErrors({ form: 'Could not save this post. Check local storage settings and try again.' });
      return;
    }
    navigate(`/blog/${encodeURIComponent(updatedPost.id)}`, { replace: true });
  }

  /** Return to the post list without changing stored content. */
  function cancel() {
    navigate('/blogs');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link to="/blogs" className="text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline">Back to All Posts</Link>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{existingPost ? 'Edit post' : 'Write a new post'}</h1>
          <p className="mt-2 text-slate-600">Plain text is all you need. Your draft stays in this browser.</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="post-title" className="mb-2 block text-sm font-semibold text-slate-800">Title</label>
              <input id="post-title" name="title" autoComplete="off" value={title} onChange={(event) => setTitle(event.target.value)} aria-required="true" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />
              {errors.title && <p id="title-error" role="alert" className="mt-2 text-sm text-red-700">{errors.title}</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="post-content" className="block text-sm font-semibold text-slate-800">Content</label>
                <span className="text-xs text-slate-500">{content.length} characters</span>
              </div>
              <textarea id="post-content" name="content" value={content} onChange={(event) => setContent(event.target.value)} aria-required="true" aria-invalid={Boolean(errors.content)} aria-describedby={errors.content ? 'content-error' : undefined} className="min-h-64 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />
              {errors.content && <p id="content-error" role="alert" className="mt-2 text-sm text-red-700">{errors.content}</p>}
            </div>
            {errors.form && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button type="submit" className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">{existingPost ? 'Save changes' : 'Publish post'}</button>
              <button type="button" onClick={cancel} className="rounded-lg px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">Cancel</button>
            </div>
          </form>
        </section>
        <p className="mt-5 text-xs leading-5 text-slate-500">This demonstration stores posts in unencrypted browser storage. Avoid real passwords and sensitive content.</p>
      </main>
    </div>
  );
}
