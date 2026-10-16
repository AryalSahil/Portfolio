import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { AdminProfile } from '../../types/portfolio.js';
import { setStoredSessionToken } from '../../utils/api.js';

interface AdminLoginProps {
  onLoginSuccess: (profile: AdminProfile) => Promise<void> | void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please provide the administrator password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials. Access denied.');
      }

      // Store the session token to support header-based authentication in iframe environments
      if (data.token) {
        setStoredSessionToken(data.token);
      }

      // Wait for authentication state and navigation
      await onLoginSuccess(data.profile);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center items-center px-4 sm:px-6 relative selection:bg-indigo-500/30">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to portfolio button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <button
          onClick={onBackToSite}
          type="button"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-8 relative">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Secure session-authenticated control system for portfolio management
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800/90 bg-[#0e1017]/90 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="admin-pass" className="font-mono uppercase tracking-wider text-slate-400">
                  Master Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter administrator password..."
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-colors disabled:opacity-60"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              Secured with HTTP-only session tokens & rate-limiting protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
