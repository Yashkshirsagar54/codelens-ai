import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { CodeLensLogo } from '../CodeLensLogo';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { Button } from '../ui/Button';

export const CodeLensCTASection: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const highlights = [
    '20 Free Daily Reviews',
    'No Credit Card Required',
    'Instant Setup in 30 Seconds',
  ];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiquidGlassCard glowColor="accent" className="p-8 sm:p-14 md:p-20 text-center shadow-2xl overflow-hidden group">
          {/* Giant Background Watermark Brand Emblem */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-extrabold text-[90px] sm:text-[140px] md:text-[180px] text-black/[0.03] dark:text-white/5 tracking-tighter pointer-events-none whitespace-nowrap -z-0 font-sans">
            CODELENS AI
          </div>

          {/* CodeLens Brand Logo Emblem */}
          <motion.div
            initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex justify-center mb-6"
          >
            <CodeLensLogo size="lg" showText={false} />
          </motion.div>

          {/* Main Closing Headline */}
          <motion.h2
            initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-700 dark:text-white tracking-tight uppercase leading-tight max-w-4xl mx-auto"
          >
            Start Reviewing Code with{' '}
            <span className="text-[#159C63] dark:text-[#5ed29c]">
              CodeLens AI Today.
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 mt-4 text-base sm:text-lg text-slate-600 dark:text-white/70 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Join thousands of developers shipping cleaner, safer, and higher-quality code faster with automated AI intelligence.
          </motion.p>

          {/* Polished Checkmark Highlights Strip */}
          <motion.div
            initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8"
          >
            {highlights.map((item) => (
              <div
                key={item}
                className="relative group/badge flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-[#159C63]/50 dark:hover:border-[#5ed29c]/50 backdrop-blur-md transition-all duration-200 shadow-sm"
              >
                <div className="p-0.5 rounded-full bg-[#159C63]/15 dark:bg-[#5ed29c]/20 border border-[#159C63]/40 dark:border-[#5ed29c]/40 text-[#159C63] dark:text-[#5ed29c] group-hover/badge:scale-110 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-white/90 group-hover/badge:text-black dark:group-hover/badge:text-white transition-colors">
                  {item}
                </span>

                <span className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#159C63] dark:via-[#5ed29c] to-transparent opacity-60 group-hover/badge:opacity-100 transition-opacity" />
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" showArrow className="w-full sm:w-auto px-10 py-4 text-xs font-bold">
                START FREE TRIAL
              </Button>
            </Link>

            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto px-8 py-4 text-xs font-bold">
                EXPLORE DEMO WORKSPACE
              </Button>
            </Link>
          </motion.div>
        </LiquidGlassCard>
      </div>
    </section>
  );
};
