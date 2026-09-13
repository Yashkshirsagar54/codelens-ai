import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#070b0a] py-6 mt-auto text-slate-600 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-white/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#159C63] dark:bg-[#5ed29c] animate-pulse" />
          <span className="font-medium text-slate-700 dark:text-slate-300">AI Review Engine Operational</span>
        </div>

        <p>© {new Date().getFullYear()} CodeLens AI. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};
