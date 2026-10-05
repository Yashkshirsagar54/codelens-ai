import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Zap } from 'lucide-react';
import { CodeLensLogo } from '../CodeLensLogo';
import { ThemeToggle } from '../ThemeToggle';

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'About', to: '/about' },
    { label: 'Features', to: '/features' },
    { label: 'Live Demo', to: '/#demo' },
    { label: 'Languages', to: '/#languages' },
    { label: 'How It Works', to: '/#how-it-works' },
    { label: 'Pricing', to: '/#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-[#070b0a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-xs dark:shadow-2xl'
          : 'bg-transparent border-b border-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center min-h-[44px]">
            <CodeLensLogo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-slate-100/80 dark:bg-white/[0.03] p-1.5 rounded-full border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
            {navLinks.map((link) => {
              const isAnchor = link.to.includes('#');
              return isAnchor ? (
                <a
                  key={link.label}
                  href={link.to}
                  onMouseEnter={() => setActiveHover(link.label)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 group"
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#159C63] dark:bg-[#5ed29c] transition-all duration-300 ${
                      activeHover === link.label ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onMouseEnter={() => setActiveHover(link.label)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative px-4 py-2 rounded-full text-xs font-bold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 group"
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#159C63] dark:bg-[#5ed29c] transition-all duration-300 ${
                      activeHover === link.label ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/admin"
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px] flex items-center gap-1.5"
            >
              <span>Admin DB</span>
            </Link>

            <Link
              to="/login"
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px] flex items-center"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/15 transition-colors min-h-[44px] flex items-center"
            >
              Register
            </Link>

            <Link
              to="/dashboard"
              className="group relative inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white dark:text-[#070b0a] bg-gradient-to-r from-[#159C63] to-teal-600 dark:bg-[#5ed29c] dark:hover:bg-[#4ec28c] shadow-md shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#070b0a]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-4 pt-2 pb-6 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isAnchor = link.to.includes('#');
              return isAnchor ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-slate-800 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold text-slate-800 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider text-white dark:text-[#070b0a] bg-gradient-to-r from-[#159C63] to-teal-600 dark:bg-[#5ed29c]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Launch Workspace</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
