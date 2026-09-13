import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SectionDividerProps {
  label?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative py-12 flex items-center justify-center overflow-hidden bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300">
      {/* Background Line */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/15 to-transparent relative">
          {/* Animated Beaming Glowing Pulse Line */}
          <motion.div
            initial={prefersReducedMotion ? false : { x: '-100%' }}
            animate={prefersReducedMotion ? false : { x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#159C63] dark:via-[#5ed29c] to-transparent opacity-80"
          />
        </div>
      </div>

      {/* Optional Label Badge */}
      {label && (
        <div className="absolute px-4 py-1 rounded-full bg-white/80 dark:bg-[#070b0a] border border-[#159C63]/40 dark:border-[#5ed29c]/40 text-[#159C63] dark:text-[#5ed29c] font-jakarta text-[10px] font-bold uppercase tracking-widest shadow-md backdrop-blur-sm">
          {label}
        </div>
      )}
    </div>
  );
};
