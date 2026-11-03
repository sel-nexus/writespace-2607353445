import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { getSession } from './utils/storage.js';

/**
 * Route the static single-page application.
 * @returns {JSX.Element} Application routes.
 */
export default function App() {
  const session = getSession();
  return (
    <Routes>
      <Route path="/" element={
        <main className="min-h-screen bg-slate-50 text-slate-900">
          <header className="sticky top-0 z-10 border-b border-slate-100 bg-white shadow-sm">
            <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
              <Link to="/" className="text-xl font-extrabold tracking-tight text-indigo-700">WriteSpace</Link>
              {session ? <Link className="rounded-full bg-indigo-700 px-5 py-2 font-semibold text-white" to={session.role === 'admin' ? '/admin' : '/blogs'}>Go to Dashboard</Link> : <div className="flex items-center gap-4"><Link className="font-semibold text-slate-700" to="/login">Login</Link><Link className="rounded-full bg-indigo-700 px-5 py-2 font-semibold text-white" to="/register">Get Started</Link></div>}
            </nav>
          </header>
          <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-4 font-semibold text-indigo-700">A little room to write</p>
              <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-6xl">Your thoughts. Your space. Beautifully simple.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Read thoughtful posts and make a place for your own ideas, right here in your browser.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link to={session ? '/blogs' : '/login'} className="rounded-full bg-indigo-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-800">Start Reading</Link><Link to="/register" className="rounded-full border border-indigo-200 bg-white px-6 py-3 font-semibold text-indigo-800 hover:bg-indigo-50">Get Started Free</Link></div>
              <p className="mt-8 max-w-xl text-sm leading-6 text-slate-500">WriteSpace is a demo. Posts, accounts, and passwords are kept as plain text in this browser, not secured or encrypted. Never use real credentials or sensitive information.</p>
            </div>
            <aside className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-xl shadow-indigo-950/10">
              <h2 className="text-2xl font-bold text-slate-900">A calm place for ideas</h2>
              <p className="mt-3 leading-7 text-slate-600">Write freely. Read the community. Keep your demo content on this device.</p>
              <ul className="mt-6 space-y-4 text-sm text-slate-700"><li><strong>Write freely</strong><br />Plain-text writing without distractions.</li><li><strong>Local by design</strong><br />Demo data stays in browser storage. It is not private from other people using this device.</li><li><strong>Instant and simple</strong><br />A static experience without a server.</li></ul>
            </aside>
          </section>
        </main>
      } />
      <Route path="/login" element={<ProtectedRoute guestOnly><LoginPage /></ProtectedRoute>} />
      <Route path="/register" element={<ProtectedRoute guestOnly><RegisterPage /></ProtectedRoute>} />
      <Route path="/blogs" element={<ProtectedRoute><main className="p-8"><h1 className="text-3xl font-bold">Your reading space</h1><p className="mt-2 text-slate-600">Your blog library will appear here.</p></main></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><main className="p-8"><h1 className="text-3xl font-bold">Admin dashboard</h1><p className="mt-2 text-slate-600">Administration tools are available here.</p></main></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly><main className="p-8"><h1 className="text-3xl font-bold">Manage users</h1></main></ProtectedRoute>} />
      <Route path="/blog/:id" element={<ProtectedRoute><Navigate to="/blogs" replace /></ProtectedRoute>} />
      <Route path="/write" element={<ProtectedRoute><Navigate to="/blogs" replace /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><Navigate to="/blogs" replace /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
