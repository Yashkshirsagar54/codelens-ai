import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { AppBackground } from '../components/ui/AppBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { AlertTriangle, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
              This Terms of Service text is a sample placeholder for CodeLens AI development preview.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            LEGAL AGREEMENT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-700 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#159C63] dark:text-[#5ed29c]" />
            <span>TERMS OF SERVICE</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-white/50 font-mono">Last Updated: August 2, 2026</p>
        </div>

        <LiquidGlassCard className="p-8 space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">1. Acceptance of Terms</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              By accessing or using CodeLens AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the service.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">2. Permitted Use & Usage Quotas</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              CodeLens AI provides AI-assisted code review metrics for developer productivity. Free tier accounts are subject to daily rate limits (20 analyses/day). You agree not to reverse engineer, abuse, or bypass API quotas.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-700 dark:text-white">3. Disclaimer of AI Accuracy</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              Code reviews are generated automatically using artificial intelligence models. While designed for high accuracy, AI suggestions may occasionally contain false positives. Developers retain full responsibility for verifying code before deploying to production.
            </p>
          </section>
        </LiquidGlassCard>
      </main>

      <LandingFooter />
    </div>
  );
};
