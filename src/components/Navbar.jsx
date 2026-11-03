import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { clearSession } from '../utils/storage.js';

/**
 * Render authenticated navigation, role-specific destinations, and logout.
 * @param {Object} props Current signed-in session.
 * @returns {JSX.Element} Responsive authenticated header.
 */
export default function Navbar({ session }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = session.role === 'admin'
    ? [{ label: 'All Blogs', to: '/blogs' }, { label: 'Write', to: '/write' }, { label: 'Users', to: '/users' }]
    : [{ label: 'All Blogs', to: '/blogs' }, { label: 'Write', to: '/write' }];

  /** Clear the browser-local session and return to public home. */
  function logout() {
    clearSession();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link to="/" className="shrink-0 text-xl font-extrabold tracking-tight text-indigo-700">WriteSpace</Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-800'}`}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Avatar role={session.role} /><span>{session.displayName}</span></span>
          <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">Logout</button>
        </div>
        <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 md:hidden" aria-expanded={menuOpen} aria-controls="member-mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
      </nav>
      {menuOpen && (
        <div id="member-mobile-menu" className="border-t border-slate-100 bg-white px-5 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <p className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700"><Avatar role={session.role} size="small" />{session.displayName}</p>
            {links.map((link) => <Link key={link.to} onClick={() => setMenuOpen(false)} to={link.to} className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-indigo-50">{link.label}</Link>)}
            <button type="button" onClick={logout} className="rounded-lg px-4 py-3 text-left font-semibold text-slate-600 hover:bg-slate-100">Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}

Navbar.propTypes = {
  session: PropTypes.shape({
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    displayName: PropTypes.string.isRequired,
  }).isRequired,
};
