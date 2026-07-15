import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';
import { ArrowLeft } from "lucide-react";
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password, remember);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Sign in failed.');
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col w-[44%] bg-gray-950 p-12 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0B0F19]">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
        linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
      `,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Soft Glow */}
          {/* <div className="absolute w-[500px] h-[500px] rounded-full bg-yellow-300/10 blur-3xl" /> */}

          {/* Logo */}
          <img
            src="/assets/logo.png"
            alt="WIP"
            className="relative z-10 w-40 h-auto object-contain transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Project Operating System</p>
          <h1 className="text-3xl font-black text-white leading-tight mb-6">
            Your projects.<br />Your workflow.<br />Your way.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            WIP brings together tasks, sprints, docs, and analytics into one focused workspace — built for developers who ship.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '15+', label: 'Blueprints' },
              { value: '6', label: 'Project views' },
              { value: '100%', label: 'Open source' },
            ].map(stat => (
              <div key={stat.label} className="border border-white/10 rounded-xl p-4">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 relative z-10">© 2026 WIP · MIT License</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-12 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-yellow-300 flex items-center justify-center">
            <span className="text-xs font-black text-gray-900">W</span>
          </div>
          <span className="text-sm font-bold text-gray-900">WIP</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Home
        </Link>

        <div className="max-w-sm w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to your workspace</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className={cn(
                  'w-full px-4 py-2.5 text-sm border rounded-xl text-gray-900 placeholder-gray-400 bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all',
                  'border-gray-200'
                )}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700" htmlFor="login-password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-gray-900"
              />
              <span className="text-xs text-gray-600">Stay signed in for 30 days</span>
            </label>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] text-gray-400 font-medium">
              <span className="bg-white px-3">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* OAuth placeholder */}
          <button
            id="login-github"
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2.5 border border-gray-200 py-2.5 rounded-xl text-sm text-gray-500 font-medium bg-gray-50 cursor-not-allowed opacity-60"
            title="GitHub OAuth — coming in v1.0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-700">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
            GitHub — Coming soon
          </button>

          {/* Sign up link */}
          <p className="text-center text-xs text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-gray-900 hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
