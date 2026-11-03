import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { homeFor } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

/**
 * Guard a route using the current browser-local role session.
 * @param {Object} props Guard options.
 * @returns {JSX.Element} Route content or a role-appropriate redirect.
 */
export default function ProtectedRoute({ adminOnly = false, guestOnly = false, children }) {
  const session = getSession();
  if (guestOnly && session) return <Navigate to={homeFor(session)} replace />;
  if (!guestOnly && !session) return <Navigate to="/login" replace />;
  if (adminOnly && session.role !== 'admin') return <Navigate to="/blogs" replace />;
  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  adminOnly: PropTypes.bool,
  guestOnly: PropTypes.bool,
  children: PropTypes.node,
};
