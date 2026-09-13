import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Settings, LogOut, Cpu, Database } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, isSignedIn, signOut } = useAuth();
  const location = useLocation();

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Developer';
  const primaryEmail = user?.email || '';
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id || 'dev'}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/90 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#159C63] to-teal-600 dark:from-[#5ed29c] dark:to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform text-white dark:text-slate-950">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">CodeLens</span>
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-[#159C63] dark:text-[#5ed29c] font-mono font-bold border border-emerald-500/20">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">Production Code Intelligence</p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-emerald-500/15 text-[#159C63] dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              location.pathname === '/settings'
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              location.pathname === '/admin'
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin DB</span>
          </Link>

          {/* Light / Dark Mode Toggle */}
          <div className="pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <ThemeToggle />
          </div>

          {/* User Account & Sign Out */}
          {isSignedIn && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-8 h-8 rounded-full border border-emerald-500/40 object-cover bg-slate-100 dark:bg-slate-800"
                />
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{primaryEmail}</p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                title="Sign out of CodeLens"
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
