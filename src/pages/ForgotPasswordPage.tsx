import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate delay — in production this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-lg bg-yellow-300 flex items-center justify-center">
            <span className="text-xs font-black text-gray-900">W</span>
          </div>
          <span className="text-sm font-bold text-gray-900">WIP</span>
        </Link>

        {submitted ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              If an account exists for <strong className="text-gray-800">{email}</strong>, we've sent password reset instructions.
            </p>
            <p className="text-xs text-gray-400 mb-6">Didn't receive it? Check your spam folder.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:underline"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <Mail size={20} className="text-gray-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Enter your email and we'll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} id="forgot-password-form" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="forgot-email">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
                />
              </div>

              <button
                id="forgot-submit"
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Sending...</>
                ) : (
                  'Send reset instructions'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
              >
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
