import React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface FloatingCodeSymbol {
  id: number;
  symbol: string;
  left: string;
  duration: number;
  delay: number;
  size: string;
  color: string;
  swayAmount: number;
}

// Staggered negative delays ensure symbols are already flowing across the full screen upon load
const FLOATING_CODE_SYMBOLS: FloatingCodeSymbol[] = [
  { id: 1, symbol: '{ }', left: '3%', duration: 18, delay: -2, size: 'text-sm sm:text-base font-bold', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: 18 },
  { id: 2, symbol: 'fn', left: '9%', duration: 22, delay: -8, size: 'text-xs sm:text-sm font-semibold', color: 'text-teal-600 dark:text-teal-300/75', swayAmount: -20 },
  { id: 3, symbol: '< / >', left: '15%', duration: 16, delay: -13, size: 'text-sm sm:text-base font-bold', color: 'text-cyan-700 dark:text-cyan-300/80', swayAmount: 18 },
  { id: 4, symbol: 'async', left: '22%', duration: 24, delay: -5, size: 'text-xs sm:text-sm font-medium', color: 'text-emerald-700 dark:text-purple-300/75', swayAmount: -16 },
  { id: 5, symbol: 'const', left: '28%', duration: 15, delay: -11, size: 'text-xs sm:text-sm font-semibold', color: 'text-amber-600 dark:text-amber-300/75', swayAmount: 22 },
  { id: 6, symbol: '01', left: '34%', duration: 21, delay: -17, size: 'text-xs font-mono font-extrabold', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: -18 },
  { id: 7, symbol: 'type', left: '40%', duration: 19, delay: -3, size: 'text-xs sm:text-sm font-medium', color: 'text-teal-600 dark:text-teal-300/75', swayAmount: 20 },
  { id: 8, symbol: 'auth', left: '46%', duration: 23, delay: -9, size: 'text-xs sm:text-sm font-semibold', color: 'text-cyan-700 dark:text-cyan-300/80', swayAmount: -22 },
  { id: 9, symbol: 'git', left: '52%', duration: 17, delay: -14, size: 'text-xs sm:text-sm font-medium', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: 16 },
  { id: 10, symbol: 'json', left: '58%', duration: 25, delay: -6, size: 'text-xs sm:text-sm font-semibold', color: 'text-emerald-700 dark:text-emerald-300/80', swayAmount: -20 },
  { id: 11, symbol: 'db', left: '64%', duration: 16, delay: -12, size: 'text-xs sm:text-sm font-bold', color: 'text-amber-600 dark:text-amber-300/75', swayAmount: 18 },
  { id: 12, symbol: 'ai', left: '70%', duration: 20, delay: -16, size: 'text-xs sm:text-sm font-bold', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: -14 },
  { id: 13, symbol: 'log', left: '76%', duration: 22, delay: -4, size: 'text-xs sm:text-sm font-medium', color: 'text-teal-600 dark:text-teal-300/75', swayAmount: 22 },
  { id: 14, symbol: 'api', left: '82%', duration: 18, delay: -10, size: 'text-xs sm:text-sm font-semibold', color: 'text-cyan-700 dark:text-cyan-300/80', swayAmount: -20 },
  { id: 15, symbol: 'OWASP', left: '88%', duration: 24, delay: -15, size: 'text-xs sm:text-sm font-extrabold', color: 'text-emerald-700 dark:text-purple-300/80', swayAmount: 16 },
  { id: 16, symbol: 'let', left: '94%', duration: 19, delay: -7, size: 'text-xs sm:text-sm font-medium', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: -18 },
  { id: 17, symbol: 'try', left: '13%', duration: 23, delay: -19, size: 'text-xs sm:text-sm font-medium', color: 'text-amber-600 dark:text-amber-300/75', swayAmount: 20 },
  { id: 18, symbol: 'await', left: '49%', duration: 21, delay: -1, size: 'text-xs sm:text-sm font-semibold', color: 'text-teal-600 dark:text-teal-300/75', swayAmount: -16 },
  { id: 19, symbol: 'A', left: '37%', duration: 26, delay: -11, size: 'text-sm font-bold', color: 'text-cyan-700 dark:text-cyan-300/80', swayAmount: 24 },
  { id: 20, symbol: 'X', left: '67%', duration: 20, delay: -18, size: 'text-sm font-bold', color: 'text-[#159C63] dark:text-[#5ed29c]/80', swayAmount: -22 },
];

export const CodeFlowBackground: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20 select-none transform-gpu">
      {/* GPU-Accelerated Floating Code & Keywords */}
      {FLOATING_CODE_SYMBOLS.map((p) => (
        <div
          key={p.id}
          style={
            {
              left: p.left,
              '--float-duration': `${p.duration}s`,
              '--float-delay': `${p.delay}s`,
              '--sway-x': `${p.swayAmount}px`,
            } as React.CSSProperties
          }
          className={`absolute font-mono ${p.size} ${p.color} tracking-wider whitespace-nowrap animate-code-float pointer-events-none transition-opacity duration-300`}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};
