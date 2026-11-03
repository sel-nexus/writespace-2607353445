import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Render sticky navigation for guests and authenticated visitors.
 * @param {Object} props Navigation options.
 * @returns {JSX.Element} Public navigation header.
 */
export default function PublicNavbar({ session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = session?.role === 'admin' ? '/admin' : '/blogs';
  const avatar = session?.role === 'admin' ? '👑' : '📖';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-indigo-700">WriteSpace</Link>
        <div className="hidden items-center gap-3 sm:flex">
          {session ? (
            <>
              <span className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <span aria-hidden="true" className={`grid h-8 w-8 place-items-center rounded-full text-white ${session.role === 'admin' ? 'bg-violet-700' : 'bg-indigo-600'}`}>{avatar}</span>
                <span>{session.displayName}</span>
              </span>
              <Link to={dashboardPath} className="rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">Go to Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">Login</Link>
              <Link to="/register" className="rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">Get Started</Link>
            </>
          )}
        </div>
        <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 sm:hidden" aria-expanded={menuOpen} aria-controls="public-mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
      </nav>
      {menuOpen && (
        <div id="public-mobile-menu" className="border-t border-slate-100 bg-white px-5 py-3 sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {session ? (
              <>
                <p className="px-3 py-2 text-sm text-slate-700">Signed in as <strong>{session.displayName}</strong></p>
                <Link onClick={() => setMenuOpen(false)} to={dashboardPath} className="rounded-lg bg-indigo-700 px-4 py-3 text-center font-semibold text-white">Go to Dashboard</Link>
              </>
            ) : (
              <>
                <Link onClick={() => setMenuOpen(false)} to="/login" className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Login</Link>
                <Link onClick={() => setMenuOpen(false)} to="/register" className="rounded-lg bg-indigo-700 px-4 py-3 text-center font-semibold text-white">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

PublicNavbar.propTypes = {
  session: PropTypes.shape({
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    displayName: PropTypes.string.isRequired,
  }),
};
