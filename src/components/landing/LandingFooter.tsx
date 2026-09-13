import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { CodeLensLogo } from '../CodeLensLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative bg-slate-50 dark:bg-[#070b0a] text-slate-700 dark:text-white border-t border-slate-200 dark:border-white/10 pt-16 pb-12 overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Giant CodeLens AI Brand Emblem Logo Banner */}
        <div className="relative py-12 rounded-3xl bg-white dark:bg-white/[0.015] border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden text-center flex flex-col items-center justify-center space-y-4 shadow-xs dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-emerald-500/5 pointer-events-none" />

          <CodeLensLogo size="xl" />

          <p className="text-xs text-slate-500 dark:text-white/70 max-w-md font-normal px-4">
            Automated Code Intelligence &amp; Security Audit Engine
          </p>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-3">
            <CodeLensLogo size="sm" />
            <p className="text-slate-500 dark:text-white/60 max-w-xs leading-relaxed font-normal">
              CodeLens AI empowers software engineering teams to catch vulnerabilities, optimize performance, and refactor architecture in real time.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2 text-slate-500 dark:text-white/60">
              <li><Link to="/features" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Features Suite</Link></li>
              <li><Link to="/about" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Architecture &amp; Mission</Link></li>
              <li><a href="/#demo" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Interactive Demo</a></li>
              <li><a href="/#pricing" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">AI Capabilities</h4>
            <ul className="space-y-2 text-slate-500 dark:text-white/60">
              <li><Link to="/features" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">AI Code Review</Link></li>
              <li><Link to="/features" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Code Translator</Link></li>
              <li><Link to="/features" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Security Scanner</Link></li>
              <li><Link to="/features" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Unit Test Generator</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Legal &amp; Trust</h4>
            <ul className="space-y-2 text-slate-500 dark:text-white/60">
              <li><Link to="/privacy" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">Security Commitment</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-white/50">
          <p>© {new Date().getFullYear()} CodeLens AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#159C63] dark:hover:text-[#5ed29c] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
