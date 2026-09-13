import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';

export const HowItWorksSection: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Embedded Typewriter Code Animation State for Step 2
  const fullCodeText = `if (user.isPremium = true) {`;
  const [typedText, setTypedText] = useState('');
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(fullCodeText);
      setShowBadge(true);
      return;
    }

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex <= fullCodeText.length) {
        setTypedText(fullCodeText.slice(0, charIndex));
        charIndex++;
      } else {
        setShowBadge(true);
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const steps = [
    {
      step: '01',
      title: 'Paste Code or Connect PR',
      description: 'Input your code snippet directly, upload a file, or paste a GitHub pull request URL.',
      icon: <Code2 className="w-5 h-5 text-[#159C63] dark:text-[#5ed29c]" />,
    },
    {
      step: '02',
      title: 'AI Analyzes AST & Security',
      description: 'CodeLens AI inspects AST node structures, OWASP security rules, and performance bottlenecks.',
      icon: <Cpu className="w-5 h-5 text-[#159C63] dark:text-[#5ed29c]" />,
    },
    {
      step: '03',
      title: 'Receive Instant Quality Report',
      description: 'Get an overall score, classified issue cards (Critical, Warning, Passed), and exact line references.',
      icon: <Sparkles className="w-5 h-5 text-[#159C63] dark:text-[#5ed29c]" />,
    },
    {
      step: '04',
      title: 'Apply 1-Click Refactorings',
      description: 'Copy optimized code solutions and ship clean, production-ready code with confidence.',
      icon: <CheckCircle2 className="w-5 h-5 text-[#159C63] dark:text-[#5ed29c]" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            4-STEP AUTOMATED WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-700 dark:text-white">
            HOW CODELENS AI WORKS<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-white/70 font-normal">
            From code input to production-ready refactoring in seconds.
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <LiquidGlassCard glowColor="accent" className="h-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-[#159C63] dark:text-[#5ed29c]">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-[#159C63]/10 dark:bg-[#5ed29c]/10 border border-[#159C63]/20 dark:border-[#5ed29c]/20 flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-700 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-normal">{s.description}</p>

                {/* Embedded Typewriter Snippet inside Step 2 */}
                {idx === 1 && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-white/50">
                      <span>Live AST Inspection</span>
                      <span className="text-[#159C63] dark:text-[#5ed29c]">Line 42</span>
                    </div>
                    <pre className="text-[11px] font-mono text-[#159C63] dark:text-[#5ed29c]">
                      <code>{typedText}<span className="animate-pulse">|</span></code>
                    </pre>
                    {showBadge && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pt-1"
                      >
                        <SeverityBadge severity="critical" label="Accidental Assignment Bug" />
                      </motion.div>
                    )}
                  </div>
                )}
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
