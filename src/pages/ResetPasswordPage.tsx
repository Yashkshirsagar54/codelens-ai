import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBackground } from '../components/ui/AppBackground';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { Button } from '../components/ui/Button';
import { CodeLensLogo } from '../components/CodeLensLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Loader2,
} from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { resetPasswordForEmail, verifyResetToken, updatePassword } = useAuth();

  // Mode: if token is present in URL, we are in 'create-new-password' mode
  const isResetMode = Boolean(token);

  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & validation states
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(isResetMode);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  // If token is present in query parameters, verify token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifyingToken(false);
      return;
    }

    let isMounted = true;
    const checkToken = async () => {
      setIsVerifyingToken(true);
      setError(null);

      const res = await verifyResetToken(token);
      if (!isMounted) return;

      setIsVerifyingToken(false);
      if (res.valid) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setError(res.error || 'The password reset link is invalid or has expired.');
      }
    };

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token, verifyResetToken]);

  // Request password reset link via email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    const { error: resetErr, message: respMsg } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetErr) {
      setError(resetErr.message || 'Failed to dispatch password reset email.');
    } else {
      setEmailSent(true);
      setMessage(respMsg || `A password reset link has been dispatched to ${email}.`);
    }
  };

  // Submit new password using reset token
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    setLoading(true);
    const { error: updateErr, message: successMsg } = await updatePassword(newPassword, token);
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message || 'Failed to update password.');
    } else {
      setResetCompleted(true);
      setMessage(successMsg || 'Password successfully updated! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col justify-between transition-colors duration-300 selection:bg-emerald-500/20">
      <AppBackground />
      <CodeFlowBackground />

      {/* Top Header Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <CodeLensLogo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <LiquidGlassCard className="p-6 sm:p-8 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                {isResetMode ? 'SET NEW PASSWORD' : 'RESET PASSWORD'}
                <span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-white/60">
                {isResetMode
                  ? 'Enter your new credentials to restore account access'
                  : 'Enter your registered email to receive a secure recovery link'}
              </p>
            </div>

            {/* Success Message Banner */}
            {message && !resetCompleted && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Token Verification Loading State */}
            {isVerifyingToken && (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#159C63] dark:text-[#5ed29c] mx-auto" />
                <p className="text-xs text-slate-600 dark:text-white/70">
                  Verifying your secure password reset token...
                </p>
              </div>
            )}

            {/* Token Expired / Invalid State */}
            {!isVerifyingToken && isResetMode && isTokenValid === false && (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-600 dark:text-white/70">
                  This password reset link is invalid, expired, or has already been used. Please request a new recovery link.
                </p>
                <Link
                  to="/reset-password"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#159C63] hover:bg-[#128353] text-white text-xs font-bold transition-all"
                >
                  <span>Request New Link</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Password Reset Completed State */}
            {resetCompleted && (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-[#159C63] dark:border-[#5ed29c] flex items-center justify-center mx-auto text-[#159C63] dark:text-[#5ed29c]">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Password Updated!
                </h2>
                <p className="text-xs text-slate-600 dark:text-white/70">
                  Your credentials have been securely updated. Redirecting to sign in...
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 text-xs font-bold"
                  >
                    SIGN IN NOW
                  </Button>
                </div>
              </div>
            )}

            {/* Mode 1: Request Reset Link Form (When not in reset mode) */}
            {!isResetMode && !emailSent && (
              <form onSubmit={handleRequestReset} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>DISPATCHING RECOVERY LINK...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND RESET LINK</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Email Sent Confirmation */}
            {!isResetMode && emailSent && (
              <div className="space-y-4 py-3 text-center">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-white/80 text-left space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Check your inbox:
                  </p>
                  <p>
                    We have dispatched a secure password reset link to <strong className="text-[#159C63] dark:text-[#5ed29c]">{email}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-white/50">
                    The reset link is active for 15 minutes. If you don't see it, check your spam or junk folder.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setMessage(null);
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#159C63] dark:text-[#5ed29c] hover:underline cursor-pointer"
                >
                  Re-enter Email or Resend Link
                </button>
              </div>
            )}

            {/* Mode 2: Update Password Form (When valid token is loaded) */}
            {!isVerifyingToken && isResetMode && isTokenValid === true && !resetCompleted && (
              <form onSubmit={handleUpdatePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SAVING NEW PASSWORD...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>UPDATE PASSWORD</span>
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-600 dark:text-white/60">
              Remember your password?{' '}
              <Link to="/login" className="text-[#159C63] dark:text-[#5ed29c] font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          </LiquidGlassCard>
        </div>
      </main>

      <footer className="relative z-10 py-2.5 text-center text-[10px] text-slate-500 dark:text-white/40">
        © {new Date().getFullYear()} CodeLens AI. All rights reserved.
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
