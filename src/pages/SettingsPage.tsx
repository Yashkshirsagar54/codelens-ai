import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Settings, ShieldCheck, User, Mail, Calendar, Key, Phone, Save, CheckCircle, Database, Activity, RefreshCw } from 'lucide-react';
import { AppBackground } from '../components/ui/AppBackground';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState<string>(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  );
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [stats, setStats] = useState<{ totalUsers: number; totalLogins: number; totalAnalyses: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const primaryEmail = user?.email || '—';
  const provider = user?.app_metadata?.provider || 'email';
  const role = user?.role || 'Developer';

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  const lastLoginAt = user?.last_login_at
    ? new Date(user.last_login_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Active Now';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/auth/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.warn('Failed to load db stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
    });

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col font-sans transition-colors duration-300">
      <AppBackground />
      <CodeFlowBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-[#159C63] dark:text-[#5ed29c]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account & Database Settings</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your authenticated developer profile, sync data, and inspect database activity</p>
            </div>
          </div>
          <button
            onClick={fetchStats}
            title="Refresh DB Stats"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Live Database Activity Metric Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Registered Users</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#159C63] dark:text-[#5ed29c]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Login Events</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalLogins}</p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Code Analyses Stored</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalAnalyses}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details & Edit Form */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5ed29c] to-teal-600 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
              {(fullName || primaryEmail).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{fullName || 'Developer'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{primaryEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-[#159C63] dark:text-[#5ed29c] border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                  Role: {role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[10px] font-mono font-bold uppercase">
                  Auth: {provider}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5ed29c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5ed29c]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <CheckCircle className="w-4 h-4" /> Profile updated and saved to Database!
                </span>
              ) : <span />}

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving to DB...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* User Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                <Mail className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>Primary Email</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{primaryEmail}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>Account Created</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{createdAt}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                <Activity className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>Last Login Recorded</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{lastLoginAt}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>Database Sync Status</span>
              </div>
              <p className="font-bold text-[#159C63] dark:text-[#5ed29c] text-sm">Active &amp; Persisted</p>
            </div>

            {/* Database User ID */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
                <Key className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>Database User ID</span>
              </div>
              <p className="font-mono text-slate-600 dark:text-slate-400 text-[11px] break-all">{user?.id || '—'}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
