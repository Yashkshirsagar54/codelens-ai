import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Paste or Upload Code',
    description: 'Paste any TypeScript, Python, C++, Java, or Go code snippet directly into the web workspace editor.',
    icon: Code2,
  },
  {
    number: '02',
    title: 'AI Analyzes Code',
    description: 'Our Gemini AI engine parses syntax trees, checks security rules, evaluates performance, and scans for logic bugs.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Inspect Report & Score',
    description: 'Receive an instant quality score (0–100), categorized issue breakdown, and line-by-line refactoring recommendations.',
    icon: CheckCircle2,
  },
  {
    number: '04',
    title: 'Fix & Ship Confidently',
    description: 'Apply one-click suggested fixes, export PDF/JSON analysis reports, and deploy verified clean code to production.',
    icon: Rocket,
  },
];

export const HowItWorks: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">
            Simple 4-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How CodeLens AI Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            From raw source code to automated security audits and quality reports in under 3 seconds.
          </p>
        </div>

        {/* Timeline Desktop & Mobile Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-indigo-500/20 via-indigo-500 to-indigo-500/20 -translate-y-6 pointer-events-none -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative flex flex-col items-start bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-indigo-500/40 transition-all duration-300 group"
                >
                  {/* Step Badge & Icon */}
                  <div className="w-full flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-300 dark:text-slate-700 tracking-tighter">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>

                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-indigo-500 mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 w-full">
                      <span>Next step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
