import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Database,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signInDemo } = useAuth();

  // Login Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Handle Standard Email / Mobile & Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setError('Please enter your email address or mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const { error: loginError } = await signInWithEmail(cleanInput, password);
    setIsSubmitting(false);

    if (loginError) {
      setError(loginError.message || 'Invalid credentials. Please verify your details.');
    } else {
      setSuccessMsg('Signed in successfully! Redirecting to Workspace...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    }
  };

  // Handle Quick Demo Login
  const handleDemoSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsDemoLoading(true);
    const { error: demoError } = await signInDemo();
    setIsDemoLoading(false);

    if (demoError) {
      setError(demoError.message || 'Demo login failed.');
    } else {
      setSuccessMsg('Logged into Demo Account! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col justify-between transition-colors duration-300 selection:bg-emerald-500/20">
      <AppBackground />
      <CodeFlowBackground />

      {/* Top Header Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          <CodeLensLogo size="sm" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Center Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <LiquidGlassCard className="p-5 sm:p-7 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                SIGN IN<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-white/60">
                Enter your registered details to access your workspace
              </p>
            </div>

            {/* Database Persistence Status Badge */}
            <div className="flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-[#159C63] dark:text-[#5ed29c] font-medium w-fit mx-auto">
              <Database className="w-3 h-3 text-[#159C63] dark:text-[#5ed29c]" />
              <span>Database Connected &amp; Persistent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
                {error.toLowerCase().includes('not found') && (
                  <Link
                    to="/register"
                    className="ml-6 text-[11px] font-bold text-red-600 dark:text-red-300 underline hover:text-red-700"
                  >
                    Click here to create a new account &rarr;
                  </Link>
                )}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="alex@company.com or 9876543210"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-[11px] text-[#159C63] dark:text-[#5ed29c] font-semibold hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white/80 dark:bg-[#0d1412] px-2 text-slate-400 dark:text-white/40">
                  Or test immediately
                </span>
              </div>
            </div>

            {/* Demo Account Button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isDemoLoading || isSubmitting}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isDemoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#159C63]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>Instant 1-Click Demo Login</span>
            </button>

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-600 dark:text-white/60">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#159C63] dark:text-[#5ed29c] font-bold hover:underline">
                Create Account
              </Link>
            </div>
          </LiquidGlassCard>
        </div>
      </main>

      <footer className="relative z-10 py-2.5 text-center text-[10px] text-slate-500 dark:text-white/40">
        &copy; {new Date().getFullYear()} CodeLens AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
