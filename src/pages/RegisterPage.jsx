import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { homeFor, registerUser } from '../utils/auth.js';
import { getSession } from '../utils/storage.js';

const FIELDS = [
  { key: 'displayName', label: 'Display Name', type: 'text', autocomplete: 'name' },
  { key: 'username', label: 'Username', type: 'text', autocomplete: 'username' },
  { key: 'password', label: 'Password', type: 'password', autocomplete: 'new-password' },
  { key: 'confirmPassword', label: 'Confirm Password', type: 'password', autocomplete: 'new-password' },
];

/**
 * Render self-registration and field-associated validation messages.
 * @returns {JSX.Element} Registration screen.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ displayName: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const session = getSession();
  if (session) return <Navigate to={homeFor(session)} replace />;

  /** Update one field and clear its existing error. */
  function updateField(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  /** Validate and persist the new local account. */
  function handleSubmit(event) {
    event.preventDefault();
    const result = registerUser(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate(homeFor(result.session), { replace: true });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col justify-center">
        <Link to="/" className="mb-7 text-center text-2xl font-extrabold tracking-tight text-white">WriteSpace</Link>
        <section className="rounded-3xl bg-white p-7 shadow-2xl shadow-indigo-950/25 sm:p-9">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Make room for an idea</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create a local demo account to start reading and writing.</p>
          <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="mb-2 block text-sm font-semibold text-slate-800">{field.label}</label>
                <input id={field.key} name={field.key} type={field.type} autoComplete={field.autocomplete} aria-required="true" aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} value={values[field.key]} onChange={(event) => updateField(field.key, event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30" />
                {errors[field.key] && <p id={`${field.key}-error`} role="alert" className="mt-1 text-sm text-red-700">{errors[field.key]}</p>}
              </div>
            ))}
            {errors.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
            <button type="submit" className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:translate-y-px">Create account</button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-indigo-700 underline-offset-4 hover:underline">Login</Link></p>
          <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">Demo only: account details and passwords are stored as plain text in this browser. Do not use a real password or sensitive information.</aside>
        </section>
      </div>
    </main>
  );
}
