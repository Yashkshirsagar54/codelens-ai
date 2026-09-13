import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Sparkles, Code2, GitBranch, BarChart3, ArrowUpRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Zap className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'Instant AI Code Review',
    description: 'Get deep static analysis, logic checks, and AST pattern audits delivered in under 2 seconds per pull request.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'Security & OWASP Scanning',
    description: 'Detect SQL injection, XSS, exposed secrets, and unhandled memory vulnerabilities before merging to main.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'Idiomatic Best Practices',
    description: 'Receive clean code refactoring recommendations tailored specifically to your project’s language conventions.',
  },
  {
    icon: <Code2 className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'Multi-Language AST Engine',
    description: 'First-class support for TypeScript, Python, JavaScript, Go, Rust, Java, C++, and C# with zero configuration.',
  },
  {
    icon: <GitBranch className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'GitHub & CI/CD Automation',
    badge: 'LIVE',
    description: 'Seamlessly post inline PR comments, review summaries, and pass/fail status checks directly into your workflows.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />,
    title: 'Code Quality Analytics',
    description: 'Track code health trends, defect velocity, and team security scores across repositories with real-time dashboards.',
  },
];

export const FeaturesSection: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="features" className="relative py-24 bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
        >
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            DEVELOPER-FIRST INTELLIGENCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            EVERYTHING YOU NEED TO SHIP CLEAN CODE<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-white/70 font-normal">
            Automated code intelligence engineered for modern software development teams.
          </p>
        </motion.div>

        {/* 6 Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={prefersReducedMotion ? {} : { y: -6, transition: { duration: 0.2 } }}
            >
              <LiquidGlassCard glowColor="accent" className="h-full p-7 flex flex-col justify-between group hover:border-[#5ed29c]/40 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#159C63]/10 dark:bg-[#5ed29c]/10 border border-[#159C63]/20 dark:border-[#5ed29c]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>

                    {feature.badge && (
                      <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#159C63]/15 dark:bg-[#5ed29c]/15 text-[#159C63] dark:text-[#5ed29c] border border-[#159C63]/30 dark:border-[#5ed29c]/30">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#159C63] dark:group-hover:text-[#5ed29c] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
