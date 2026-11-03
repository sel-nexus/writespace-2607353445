import PropTypes from 'prop-types';

/**
 * Render the WriteSpace role avatar using its fixed role color and glyph.
 * @param {Object} props Avatar role and optional sizing.
 * @returns {JSX.Element} Accessible role avatar.
 */
export default function Avatar({ role, size = 'normal' }) {
  const admin = role === 'admin';
  const sizeClass = size === 'small' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm';
  return (
    <span aria-label={admin ? 'Admin avatar' : 'User avatar'} role="img" className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ${sizeClass} ${admin ? 'bg-violet-700' : 'bg-indigo-600'}`}>
      {admin ? '👑' : '📖'}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  size: PropTypes.oneOf(['small', 'normal']),
};
