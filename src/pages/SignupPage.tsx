import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils';
import { ArrowLeft } from "lucide-react";
const PASSWORD_RULES = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-z]/i.test(p) },
];

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', workspace: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    // Auto-fill workspace name from display name
    if (field === 'name' && form.workspace === '') {
      setForm(prev => ({ ...prev, name: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const workspaceName = form.workspace.trim() || `${form.name.trim()}'s Workspace`;
    const result = await signup(form.name, form.email, form.password, workspaceName);
    setLoading(false);
    if (result.success) {
      navigate('/home', { replace: true });
    } else {
      setError(result.error || 'Sign up failed. Please try again.');
    }
  };

  const passwordPassed = PASSWORD_RULES.filter(r => r.test(form.password)).length;

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col w-[44%] bg-gray-950 p-12 relative overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
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
        {/* Center */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Free forever for individuals</p>
          <h1 className="text-3xl font-black text-white leading-tight mb-6">
            Join thousands of<br />builders using WIP.
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Set up your workspace in under 2 minutes. Pick a blueprint and start shipping your first sprint today.
          </p>

          {/* Feature checklist */}
          <ul className="mt-10 space-y-3">
            {[
              'Unlimited projects',
              'Blueprints & templates',
              'Sprint planning & analytics',
              'Documentation & snippets',
              'Open source — yours forever',
            ].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                <CheckCircle2 size={14} className="text-yellow-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-600 relative z-10">© 2026 WIP · MIT License</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your workspace</h2>
          <p className="text-sm text-gray-500 mb-8">Start building in minutes — no credit card needed</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="signup-form">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-name">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                autoFocus
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Sai Kumar"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-email">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="At least 6 characters"
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

              {/* Password strength */}
              {(passwordFocused || form.password) && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          i < passwordPassed
                            ? passwordPassed === 1 ? 'bg-red-400'
                              : passwordPassed === 2 ? 'bg-yellow-400'
                                : 'bg-emerald-400'
                            : 'bg-gray-100'
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {PASSWORD_RULES.map(rule => (
                      <div key={rule.label} className={cn(
                        'flex items-center gap-1.5 text-[10px] transition-colors',
                        rule.test(form.password) ? 'text-emerald-600' : 'text-gray-400'
                      )}>
                        <CheckCircle2 size={9} className={rule.test(form.password) ? 'text-emerald-500' : 'text-gray-300'} />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workspace name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="signup-workspace">
                Workspace name <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="signup-workspace"
                type="text"
                value={form.workspace}
                onChange={set('workspace')}
                placeholder={form.name ? `${form.name}'s Workspace` : 'My Workspace'}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
              />
            </div>

            {/* TOS */}
            <p className="text-[10px] text-gray-400">
              By creating an account you agree that this is an open source personal project — no data is sent to any server.
            </p>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Setting up workspace...</>
              ) : (
                <>Create workspace <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
