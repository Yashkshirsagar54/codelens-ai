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
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, verifyOTP, resendOTP } = useAuth();

  // Registration step: 'form' | 'otp' | 'success'
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Fields
  const [otpInput, setOtpInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Status & Feedback Messages
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend Timer Countdown Effect
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

  // Step 1: Submit Details & Request Real Mobile SMS OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setDevOtp(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUpWithEmail(email, password, name, phone);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message || 'Failed to create account.');
      return;
    }

    // Advance to Mobile OTP Verification step
    setStep('otp');
    setOtpInput('');
    if (res.devOtp) {
      setDevOtp(res.devOtp);
    }
    setCooldown(res.cooldownSeconds || 60);
    setStatusMessage(res.message || `SMS verification code dispatched to ${phone}!`);
  };

  // Step 2: Verify 6-digit Mobile OTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpInput.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOTP(phone.trim() || email, otpInput, name);
    setIsSubmitting(false);

    if (res.error) {
      const msg = res.error.message || 'Invalid verification code.';
      if (msg.toLowerCase().includes('expired')) {
        setError('Expired OTP. Please request a new verification code.');
      } else if (msg.toLowerCase().includes('too many')) {
        setError('Too many attempts. This code has been invalidated. Please resend a new OTP.');
      } else {
        setError(msg);
      }
      return;
    }

    // Step 3: Verified successfully
    setStep('success');
    setStatusMessage('Mobile number verified! Account activated.');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  // Resend Mobile OTP Action
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;

    setError(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    const res = await resendOTP(phone.trim() || email);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error.message || 'Failed to resend code.');
    } else {
      setCooldown(res.cooldownSeconds || 60);
      setOtpInput('');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setStatusMessage('New SMS OTP dispatched! Please check your mobile phone.');
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

      {/* Center Registration / Verification Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <LiquidGlassCard className="p-5 sm:p-7 space-y-4">
            {step === 'form' && (
              <>
                {/* Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                    CREATE ACCOUNT<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-white/60">
                    Join CodeLens AI to inspect and audit code in real time
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Chen"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                      Work Email
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
                    <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                      Mobile Number (For Real-Time OTP)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-white/80 uppercase tracking-wider mb-1">
                        Confirm
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] focus:ring-2 focus:ring-[#159C63]/20 transition-all"
                        />
                      </div>
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
                        <span>DISPATCHING SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>CONTINUE &amp; VERIFY MOBILE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] flex items-center justify-center mx-auto mb-2">
                    <Phone className="w-6 h-6 animate-pulse" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                    VERIFY MOBILE NUMBER<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-white/70">
                    We sent a 6-digit verification code via SMS to:
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white">
                    <span>{phone}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setError(null);
                        setStatusMessage(null);
                      }}
                      className="text-[#159C63] dark:text-[#5ed29c] hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                      title="Edit mobile number"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="text-[10px]">Edit</span>
                    </button>
                  </div>
                </div>

                {/* Status Banners */}
                {statusMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#159C63] dark:text-[#5ed29c] text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

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

                {/* Segmented 6-digit OTP Form */}
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-white/80 uppercase tracking-wider">
                      Enter 6-Digit SMS Code
                    </label>
                    <OtpInput
                      value={otpInput}
                      onChange={setOtpInput}
                      disabled={isSubmitting}
                      hasError={!!error}
                      autoFocus={true}
                    />
                    <p className="text-[11px] text-slate-500 dark:text-white/50">
                      Code expires in 5 minutes • Pasting supported
                    </p>
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
                        <span>VERIFYING SMS CODE...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>VERIFY &amp; ACTIVATE ACCOUNT</span>
                      </>
                    )}
                  </Button>
                </form>

                {/* Resend OTP Section with Cooldown Timer */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-center text-xs">
                  {cooldown > 0 ? (
                    <p className="text-slate-500 dark:text-white/60 font-mono text-[11px]">
                      Resend SMS available in <span className="text-[#159C63] dark:text-[#5ed29c] font-bold">{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159C63] dark:text-[#5ed29c] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend SMS OTP Code</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-[#159C63] dark:border-[#5ed29c] flex items-center justify-center mx-auto text-[#159C63] dark:text-[#5ed29c] shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-extrabold uppercase text-slate-900 dark:text-white">
                  MOBILE VERIFIED!
                </h2>
                <p className="text-xs text-slate-600 dark:text-white/70">
                  Redirecting you to the developer workspace...
                </p>
              </div>
            )}

            {/* Footer Navigation */}
            {step === 'form' && (
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-600 dark:text-white/60">
                Already registered?{' '}
                <Link to="/login" className="text-[#159C63] dark:text-[#5ed29c] font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            )}
          </LiquidGlassCard>
        </div>
      </main>

      <footer className="relative z-10 py-2.5 text-center text-[10px] text-slate-500 dark:text-white/40">
        © {new Date().getFullYear()} CodeLens AI. Real-time Production Code Intelligence.
      </footer>
    </div>
  );
};

export default RegisterPage;
