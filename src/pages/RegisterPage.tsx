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
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Database,
  ShieldCheck,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback Messages
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit Details & Save to Database
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (cleanPhone && cleanPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number, or leave it blank.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUpWithEmail(cleanEmail, password, cleanName, cleanPhone || undefined);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message || 'Failed to create account.');
      return;
    }

    // Direct registration success: account created and user details saved into DB!
    setStatusMessage('Account created and saved in database successfully! Redirecting to Workspace...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 900);
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

      {/* Center Registration Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <LiquidGlassCard className="p-5 sm:p-7 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                CREATE ACCOUNT<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-white/60">
                Enter your details below to save your profile to the database
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
                {error.toLowerCase().includes('already exists') && (
                  <Link
                    to="/login"
                    className="ml-6 text-[11px] font-bold text-red-600 dark:text-red-300 underline hover:text-red-700"
                  >
                    Click here to sign in with your password &rarr;
                  </Link>
                )}
              </div>
            )}

            {/* Success Message */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yash Kshirsagar"
                    required
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-white/40">Optional</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SAVING TO DATABASE...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>CREATE ACCOUNT &amp; SAVE</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-600 dark:text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="text-[#159C63] dark:text-[#5ed29c] font-bold hover:underline">
                Sign In
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

export default RegisterPage;
