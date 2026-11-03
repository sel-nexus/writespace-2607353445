import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { formatDate, getPosts, newestFirst } from '../utils/storage.js';
import { getSession } from '../utils/storage.js';

const features = [
  { title: 'Write Freely', text: 'Plain-text writing without distractions. Give one thought the space it needs.', color: 'border-indigo-200 bg-indigo-50/70', mark: '01' },
  { title: 'Private & Local', text: 'Your demo data stays in this browser. It is not encrypted or private from others using this device.', color: 'border-violet-200 bg-violet-50/70', mark: '02' },
  { title: 'Instant & Fast', text: 'A simple static experience with no server to operate.', color: 'border-pink-200 bg-pink-50/70', mark: '03' },
];

/**
 * Introduce WriteSpace and show recent browser-local posts to visitors.
 * @returns {JSX.Element} Public landing page.
 */
export default function LandingPage() {
  const session = getSession();
  const posts = newestFirst(getPosts()).slice(0, 3);
  const readPath = session ? '/blogs' : '/login';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicNavbar session={session} />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.2fr_0.8fr] md:py-20">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-indigo-100">A space for your words</p>
              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Your thoughts. Your space. Beautifully simple.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-indigo-50">A simple place to read, write, and make room for a new idea.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={readPath} className="rounded-full bg-white px-6 py-3.5 font-bold text-indigo-800 shadow-lg shadow-indigo-950/20 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700">Start Reading</Link>
                <Link to="/register" className="rounded-full border border-white/70 bg-white/10 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Get Started Free</Link>
              </div>
              <p className="mt-7 max-w-xl text-sm leading-6 text-indigo-100">Demo only: posts, accounts, and passwords are stored as plain text in this browser. Local storage is not secure or private. Never use real credentials or sensitive information.</p>
            </div>
            <aside className="relative mx-auto w-full max-w-sm rotate-1 rounded-3xl border border-white/50 bg-white p-6 text-slate-800 shadow-2xl shadow-indigo-950/30 transition-transform hover:rotate-0">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-lg font-bold tracking-tight text-indigo-800">WriteSpace</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">A writing space</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500">A note to begin</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900">Start with the thought you have today.</h2>
              <p className="mt-4 leading-7 text-slate-600">Write a few lines, follow a new idea, and keep going when you are ready.</p>
              <div aria-hidden="true" className="mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500" />
              <p className="mt-4 text-xs text-slate-500">Plain text, right in your browser</p>
            </aside>
          </div>
        </section>

        <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="max-w-2xl">
            <h2 id="features-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Made for the act of writing</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">Read and write simply. Your posts stay in this browser for this demonstration.</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className={`rounded-2xl border p-6 sm:p-7 ${feature.color} ${index === 0 ? 'md:translate-y-5' : index === 2 ? 'md:-translate-y-3' : ''}`}>
                <span aria-hidden="true" className="text-xs font-bold tracking-[0.14em] text-slate-500">{feature.mark}</span>
                <h3 className="mt-8 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="latest-title" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 id="latest-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Latest from the Blog</h2>
                <p className="mt-3 text-slate-600">A few recent thoughts from the WriteSpace community.</p>
              </div>
              {session && <Link to="/blogs" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Browse all posts</Link>}
            </div>
            {posts.length === 0 ? (
              <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">No posts yet - check back soon!</p>
            ) : (
              <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => {
                  const accent = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'][index % 4];
                  return (
                    <Link key={post.id} to={`/blog/${encodeURIComponent(post.id)}`} className={`group rounded-2xl border border-slate-200 border-t-4 ${accent} bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600`}>
                      <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                      <h3 className="mt-3 text-xl font-bold leading-snug text-slate-900 group-hover:text-indigo-800">{post.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{String(post.content ?? '').slice(0, 120)}</p>
                      <p className="mt-5 text-sm font-semibold text-slate-700">By {post.authorName}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div><Link to="/" className="text-xl font-bold text-white">WriteSpace</Link><p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">A local-first blog demo. Your data stays in this browser and is not encrypted.</p></div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to={readPath} className="hover:text-white">All Blogs</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
          </nav>
          <p className="text-sm text-slate-300">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}

