import React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const AppBackground: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu">
      {/* 1. Dot Matrix Background (Light: slate-300 / Dark: slate-800) */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-35 transition-opacity" />

      {/* 2. Top-Center Emerald Ambient Glow */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-emerald-400/15 dark:bg-[#5ed29c]/20 rounded-full blur-[140px] transform-gpu will-change-transform transition-all ${
          prefersReducedMotion ? '' : 'animate-pulse'
        }`}
      />

      {/* 3. Top-Right Cyber Cyan Aurora */}
      <div className="absolute -top-20 -right-20 w-[600px] h-[450px] bg-gradient-to-bl from-cyan-400/15 dark:from-cyan-500/15 via-teal-400/10 dark:via-teal-500/10 to-transparent rounded-full blur-[130px] transform-gpu" />

      {/* 4. Center-Left Deep Violet/Indigo Glow */}
      <div className="absolute top-1/3 -left-32 w-[550px] h-[450px] bg-gradient-to-tr from-purple-400/10 dark:from-purple-600/15 via-indigo-400/10 dark:via-indigo-500/10 to-transparent rounded-full blur-[150px] transform-gpu" />

      {/* 5. Bottom-Right Mint Ambient Spotlight */}
      <div className="absolute -bottom-20 -right-20 w-[650px] h-[400px] bg-gradient-to-tl from-emerald-400/10 dark:from-emerald-500/15 via-teal-400/10 dark:via-cyan-600/10 to-transparent rounded-full blur-[140px] transform-gpu" />

      {/* 6. Architectural Structural Grid Lines */}
      <div className="hidden md:block absolute inset-0">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-4 px-4 sm:px-6 lg:px-8">
          <div className="border-r border-slate-900/[0.04] dark:border-white/5 h-full" />
          <div className="border-r border-slate-900/[0.04] dark:border-white/5 h-full" />
          <div className="border-r border-slate-900/[0.04] dark:border-white/5 h-full" />
          <div className="h-full" />
        </div>
      </div>
    </div>
  );
};
