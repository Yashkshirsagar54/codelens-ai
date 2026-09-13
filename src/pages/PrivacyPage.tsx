import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { AppBackground } from '../components/ui/AppBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500/20">
      <AppBackground />
      <CodeFlowBackground />
      <LandingNavbar />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-8">
        {/* Template Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-200">Legal Disclaimer — Sample Copy</p>
            <p>
              This Privacy Policy text is a sample placeholder for CodeLens AI development preview.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            DATA PROTECTION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-700 dark:text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#159C63] dark:text-[#5ed29c]" />
            <span>PRIVACY POLICY</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/50 font-mono">Last Updated: August 2, 2026</p>
        </div>

        <LiquidGlassCard className="p-8 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">1. Information We Collect</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              CodeLens AI collects information necessary to perform code reviews and manage user accounts. This includes account data, source code snippets submitted for analysis, and generated analysis metrics.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">2. How We Use Your Data</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              Code submitted for analysis is processed via Gemini AI to generate static code review metrics, bug reports, and security suggestions. Your code snippets remain strictly private to your workspace.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">3. Third-Party Integrations</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              We integrate with secure APIs for authentication, AI static analysis, and telemetry error tracking operating under strict confidentiality standards.
            </p>
          </section>
        </LiquidGlassCard>
      </main>

      <LandingFooter />
    </div>
  );
};
