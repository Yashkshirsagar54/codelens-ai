import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBackground } from '../components/ui/AppBackground';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { Button } from '../components/ui/Button';
import { CodeLensLogo } from '../components/CodeLensLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { OtpInput } from '../components/auth/OtpInput';
import {
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmail, sendOTP, resendOTP, verifyOTP } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');

  // Password Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mobile OTP Login Fields
  const [otpPhone, setOtpPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend Timer Effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Standard Email & Password Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (error) {
      setError(error.message || 'Invalid email or password.');
    } else {
      navigate('/dashboard');
    }
  };

  // Handle Send Mobile OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = otpPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendOTP(otpPhone.trim());
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message || 'Failed to send verification code.');
    } else {
      setOtpSent(true);
      setOtpInput('');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setCooldown(res.cooldownSeconds || 60);
      setSuccessMsg(res.message || `Verification code sent to ${otpPhone}!`);
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpInput || otpInput.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await verifyOTP(otpPhone.trim(), otpInput);
    setIsSubmitting(false);

    if (error) {
      const msg = error.message || 'Invalid verification code.';
      if (msg.toLowerCase().includes('expired')) {
        setError('Expired OTP. Please request a new verification code.');
      } else if (msg.toLowerCase().includes('too many')) {
        setError('Too many attempts. Please request a new OTP code.');
      } else {
        setError(msg);
      }
    } else {
      setSuccessMsg('Verification successful! Logging in...');
      setTimeout(() => navigate('/dashboard'), 800);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;

    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const res = await resendOTP(otpPhone.trim());
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message || 'Failed to resend code.');
    } else {
      setCooldown(res.cooldownSeconds || 60);
      setOtpInput('');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setSuccessMsg('New verification code dispatched via SMS!');
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
                Access your AI code review workspace
              </p>
            </div>

            {/* Auth Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-white dark:bg-[#159C63] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'otp'
                    ? 'bg-white dark:bg-[#159C63] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mode 1: Email & Password Form */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                    Email
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                    />
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
            )}

            {/* Mode 2: Mobile OTP Verification Form */}
            {authMethod === 'otp' && (
              !otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>DISPATCHING SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND MOBILE OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-white/70 truncate max-w-[200px]">
                      SMS sent to <strong>{otpPhone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#159C63] dark:text-[#5ed29c] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Dev Simulator Helper Banner (When live SMS gateway is not yet set in .env) */}
                  {devOtp && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Development Mode OTP
                            </span>
                            <span className="font-mono text-base font-extrabold tracking-widest text-slate-900 dark:text-white">
                              {devOtp}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpInput(devOtp)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                        >
                          Auto-fill
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-white/50 border-t border-amber-500/20 pt-1.5 leading-relaxed">
                        💡 To receive real SMS on your mobile phone, connect an SMS provider (Twilio or Fast2SMS) in your <code>.env</code> file.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOTP} className="space-y-3">
                    <div className="text-center">
                      <OtpInput
                        value={otpInput}
                        onChange={setOtpInput}
                        disabled={isSubmitting}
                        hasError={!!error}
                        autoFocus={true}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting || otpInput.length !== 6}
                      className="w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>VERIFYING...</span>
                        </>
                      ) : (
                        <span>VERIFY &amp; LOGIN</span>
                      )}
                    </Button>
                  </form>

                  {/* Resend OTP */}
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-center text-xs">
                    {cooldown > 0 ? (
                      <p className="text-slate-500 dark:text-white/60 font-mono text-[11px]">
                        Resend code in <span className="text-[#159C63] dark:text-[#5ed29c] font-bold">{cooldown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159C63] dark:text-[#5ed29c] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend OTP Code</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

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
        © {new Date().getFullYear()} CodeLens AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
