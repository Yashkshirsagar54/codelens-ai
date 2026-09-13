import React from 'react';

export type LogoVariant = 'horizontal' | 'icon-only' | 'monochrome-dark' | 'monochrome-light';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface CodeLensLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showText?: boolean;
}

export const CodeLensLogo: React.FC<CodeLensLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const dimensions = {
    sm: { icon: 'w-7 h-7', text: 'text-base', badge: 'text-[9px] px-1 py-0.2' },
    md: { icon: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl', badge: 'text-xs px-2 py-0.5' },
    xl: { icon: 'w-16 h-16', text: 'text-5xl', badge: 'text-sm px-2.5 py-1' },
  }[size];

  const isMonochromeDark = variant === 'monochrome-dark';
  const isMonochromeLight = variant === 'monochrome-light';
  const isIconOnly = variant === 'icon-only' || !showText;

  // Primary Gradient Fill or Monochrome Fills
  const strokeColor = isMonochromeDark
    ? '#0F172A'
    : isMonochromeLight
    ? '#FFFFFF'
    : 'url(#emerald-teal-grad)';

  const textColor = isMonochromeDark
    ? 'text-slate-900'
    : isMonochromeLight
    ? 'text-white'
    : 'text-slate-900 dark:text-white';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark: Magnifying Glass Lens merged with Code Brackets < > */}
      <div className={`relative ${dimensions.icon} flex items-center justify-center shrink-0`}>
        <svg className="w-full h-full" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="emerald-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>

          {/* Lens Aperture Outer Ring */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Magnifying Glass Lens Handle Node */}
          <path
            d="M25 25L31 31"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Integrated Inner Code Brackets < > */}
          <path
            d="M12 13L9 16L12 19"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 13L23 16L20 19"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark Lockup */}
      {!isIconOnly && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight ${textColor} ${dimensions.text} font-sans`}>
            CodeLens
          </span>

          {/* "AI" Suffix Badge */}
          <span
            className={`font-mono font-extrabold uppercase rounded-md tracking-wider ${dimensions.badge} ${
              isMonochromeDark
                ? 'bg-slate-900 text-white'
                : isMonochromeLight
                ? 'bg-white text-slate-900'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};
