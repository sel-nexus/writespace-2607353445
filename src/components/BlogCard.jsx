import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { canManagePost } from '../utils/auth.js';
import { formatDate } from '../utils/storage.js';

const ACCENTS = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/**
 * Render one post summary with author identity and role-aware edit access.
 * @param {Object} props Post and current reader.
 * @returns {JSX.Element} Post card.
 */
export default function BlogCard({ post, index, session, onDelete }) {
  const authorRole = post.authorId === 'writespace-admin' ? 'admin' : 'user';
  const excerpt = String(post.content ?? '').slice(0, 120);
  const canEdit = canManagePost(session, post);
  return (
    <article className={`flex h-full flex-col rounded-2xl border border-slate-200 border-t-4 ${ACCENTS[index % ACCENTS.length]} bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}>
      <Link to={`/blog/${encodeURIComponent(post.id)}`} className="group flex flex-1 flex-col rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
        <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
        <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 group-hover:text-indigo-800">{post.title}</h2>
        <p className="mt-3 flex-1 leading-7 text-slate-600">{excerpt}</p>
      </Link>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Link to={`/blog/${encodeURIComponent(post.id)}`} className="flex min-w-0 items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
          <Avatar role={authorRole} size="small" />
          <span className="truncate text-sm font-semibold text-slate-700">{post.authorName}</span>
        </Link>
        {canEdit && (
          <div className="flex shrink-0 gap-2">
            <Link to={`/edit/${encodeURIComponent(post.id)}`} className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Edit</Link>
            {onDelete && <button type="button" onClick={() => onDelete(post)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">Delete</button>}
          </div>
        )}
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string, createdAt: PropTypes.string.isRequired, authorId: PropTypes.string.isRequired, authorName: PropTypes.string.isRequired }).isRequired,
  index: PropTypes.number.isRequired,
  session: PropTypes.shape({ userId: PropTypes.string.isRequired, role: PropTypes.oneOf(['admin', 'user']).isRequired }),
  onDelete: PropTypes.func,
};
