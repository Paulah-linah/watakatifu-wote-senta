import React, { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/common/Logo';
import { Button, FieldLabel, inputCls, Spinner, errorMessage } from './ui';

const Frame: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen grid lg:grid-cols-2 bg-parchment">
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-sky-950 text-white p-12">
      <img
        src="https://images.unsplash.com/photo-1720383857984-7e9a9b11eba4?auto=format&fit=crop&w=1400&q=70"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-linear-to-t from-sky-950 via-sky-950/70 to-sky-950/30" aria-hidden />
      <Link to="/" className="relative flex items-center gap-3">
        <Logo framed className="h-16 w-auto" />
        <span>
          <span className="block font-serif text-2xl font-semibold leading-none">Watakatifu Wote Senta</span>
          <span className="mt-1.5 block text-[0.7rem] uppercase tracking-[0.18em] text-gold-300">Staff portal</span>
        </span>
      </Link>
      <blockquote className="relative max-w-md">
        <p className="font-serif text-3xl italic leading-snug text-gold-100">&ldquo;I was a stranger and you welcomed me.&rdquo;</p>
        <footer className="mt-3 text-sm text-sky-100/70">Matthew 25:35</footer>
      </blockquote>
    </aside>
    <div className="flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="lg:hidden mb-6">
            <Logo framed className="h-16 w-auto" />
          </div>
          <p className="eyebrow">
            <Lock className="w-3.5 h-3.5" /> Staff only
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-sky-950">{title}</h1>
        </div>
        <div className="card p-6 sm:p-7">{children}</div>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-sky-900">
          <ArrowLeft className="w-4 h-4" /> Back to the website
        </Link>
      </div>
    </div>
  </div>
);

export function LoginPage() {
  const { session, profile, loading, signIn } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = params.get('next')?.startsWith('/admin') ? params.get('next')! : '/admin';

  if (loading) return <Spinner />;
  if (session && profile) return <Navigate to={next} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError(null);
    if (!email.trim()) return setError('Enter your email address first, then choose "Forgot password".');
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/reset-password` });
    setBusy(false);
    if (err) setError(errorMessage(err));
    else setInfo('If that address belongs to a staff account, a reset link is on its way. Check your inbox.');
  };

  return (
    <Frame title="Staff sign in">
      <form onSubmit={submit} className="space-y-4">
        <FieldLabel label="Email" htmlFor="login-email">
          <input id="login-email" type="email" autoComplete="username" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Password" htmlFor="login-password">
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldLabel>
        {session && !profile && <p className="text-xs text-rose-700">This account is not linked to a staff profile.</p>}
        {error && (
          <p className="text-xs text-rose-700" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="text-xs text-emerald-700" role="status">
            {info}
          </p>
        )}
        <Button type="submit" loading={busy} className="w-full">
          Sign in
        </Button>
        <button type="button" onClick={forgot} className="w-full text-xs text-sky-700 hover:underline">
          Forgot password?
        </button>
      </form>
    </Frame>
  );
}

export function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (!session)
    return (
      <Frame title="Reset link expired">
        <p className="text-sm text-stone-600">This reset link is invalid or has expired. Request a new one from the sign-in page.</p>
        <Link to="/admin/login" className="mt-4 inline-block text-sm font-semibold text-sky-700">
          Go to sign in
        </Link>
      </Frame>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 10) return setError('Use at least 10 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(errorMessage(err));
    navigate('/admin', { replace: true });
  };

  return (
    <Frame title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <FieldLabel label="New password" htmlFor="rp-new" hint="At least 10 characters.">
          <input id="rp-new" type="password" autoComplete="new-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Confirm new password" htmlFor="rp-confirm">
          <input id="rp-confirm" type="password" autoComplete="new-password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </FieldLabel>
        {error && (
          <p className="text-xs text-rose-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy} className="w-full">
          Save new password
        </Button>
      </form>
    </Frame>
  );
}
