import React from 'react';
import { ArrowRight } from 'lucide-react';

export type ButtonVariant = 'primary' | 'ghost' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  showArrow?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  showArrow = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#5ed29c] via-[#4ec28c] to-[#3db27c] text-[#070b0a] hover:from-[#6ee2ac] hover:to-[#4ec28c] shadow-lg shadow-[#5ed29c]/30 hover:shadow-xl hover:shadow-[#5ed29c]/50 hover:scale-[1.03] active:scale-[0.97] font-bold uppercase tracking-wider rounded-full',
    ghost:
      'bg-white/60 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-emerald-200 dark:border-white/15 hover:border-emerald-300 dark:hover:border-white/30 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] font-semibold rounded-xl shadow-sm dark:shadow-none',
    secondary:
      'bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-slate-200 border border-emerald-200 dark:border-slate-700 hover:scale-[1.02] font-semibold rounded-xl',
    danger:
      'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:scale-[1.02] font-semibold rounded-xl',
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className}`}
      {...props}
    >
      {/* Glossy Button Shine Sweep Overlay */}
      <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-700 pointer-events-none" />

      <span className="relative z-10">{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
      )}
    </button>
  );
};
