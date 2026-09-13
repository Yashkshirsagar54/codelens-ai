import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative p-1.5 rounded-full bg-transparent border-0 outline-hidden hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#159C63] dark:focus-visible:ring-[#5ed29c] ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-slate-800 group-hover:text-indigo-600 transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
