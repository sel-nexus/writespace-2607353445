import PropTypes from 'prop-types';
import Avatar from './Avatar.jsx';
import { formatDate } from '../utils/storage.js';

/**
 * Render an account row with its role and guarded deletion affordance.
 * @param {Object} props Account and deletion policy.
 * @returns {JSX.Element} Responsive account row.
 */
export default function UserRow({ account, currentUserId, isDefault = false, onDelete }) {
  const self = account.id === currentUserId;
  const disabledReason = isDefault ? 'Default admin cannot be deleted.' : self ? 'You cannot delete your own account.' : '';
  const disabled = Boolean(disabledReason);
  return (
    <div className="grid grid-cols-1 items-center gap-4 border-b border-slate-100 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] sm:gap-5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar role={account.role} size="small" />
        <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{account.displayName}</p><p className="truncate text-sm text-slate-500">{account.username}</p></div>
      </div>
      <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ring-1 ${account.role === 'admin' ? 'bg-violet-100 text-violet-700 ring-violet-300' : 'bg-indigo-100 text-indigo-700 ring-indigo-300'}`}>{account.role}</span>
      <span className="text-sm text-slate-600">{formatDate(account.createdAt)}</span>
      <span className="text-sm text-slate-500">{self ? 'Current account' : isDefault ? 'Protected account' : 'Local account'}</span>
      <button type="button" disabled={disabled} title={disabledReason || 'Delete account'} onClick={() => onDelete(account)} className="w-fit rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">Delete</button>
    </div>
  );
}

UserRow.propTypes = {
  account: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.oneOf(['admin', 'user']).isRequired, createdAt: PropTypes.string.isRequired }).isRequired,
  currentUserId: PropTypes.string,
  isDefault: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};
