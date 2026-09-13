import React from 'react';

export type GlowColor = 'accent' | 'critical' | 'warning' | 'default';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  glowColor = 'default',
  onClick,
}) => {
  const borderGlowMap = {
    accent: 'border-emerald-500/30 hover:border-emerald-500/60 dark:border-[#5ed29c]/30 dark:hover:border-[#5ed29c]/60 shadow-emerald-500/10 hover:shadow-emerald-500/20',
    critical: 'border-red-500/30 hover:border-red-500/60 shadow-red-500/10 hover:shadow-red-500/20',
    warning: 'border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/10 hover:shadow-amber-500/20',
    default: 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 shadow-slate-900/5 hover:shadow-slate-900/10 dark:shadow-black/30 dark:hover:shadow-black/50',
  }[glowColor];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border ${borderGlowMap} p-6 hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Glossy Top Specular Reflection Layer */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.08] via-transparent to-transparent pointer-events-none rounded-t-2xl" />

      {/* Hairline Frame Border Overlay */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-black/[0.04] dark:from-white/20 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Glossy Diagonal Shine Sweep on Hover */}
      <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-black/[0.03] dark:via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 pointer-events-none" />

      <div className="relative z-10 text-slate-800 dark:text-white">{children}</div>
    </div>
  );
};
