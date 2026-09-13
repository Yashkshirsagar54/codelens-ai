import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AppBackground } from '../components/ui/AppBackground';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import {
  Users,
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  Calendar,
  LogIn,
  Key,
  ShieldAlert,
  Code2,
  Database,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

interface UserItem {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: string;
  loginCount: number;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthLogItem {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  authType: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLogItem[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; totalLogins: number; totalAnalyses: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/auth/stats'),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
        setAuthLogs(sData.recentAuthLogs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col font-sans transition-colors duration-300">
      <AppBackground />
      <CodeFlowBackground />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-[#159C63] dark:text-[#5ed29c] border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Database &amp; Platform Admin</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#159C63] dark:text-[#5ed29c] border border-emerald-500/20 uppercase font-mono font-bold">
                  Live DB
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time registry of authenticated developers, login sessions, and platform code reviews
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Registered Users in DB</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats ? stats.totalUsers : '—'}
              </p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#159C63] dark:text-[#5ed29c] shadow-xs">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Total Login Events</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats ? stats.totalLogins : '—'}
              </p>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xs">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Code Reviews Audited</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats ? stats.totalAnalyses : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Card with Tabs */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Sub Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors font-bold ${
                  activeTab === 'users'
                    ? 'bg-[#159C63] text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Registered Users ({usersList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors font-bold ${
                  activeTab === 'logs'
                    ? 'bg-[#159C63] text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Login Activity Logs ({authLogs.length})</span>
              </button>
            </div>

            {activeTab === 'users' && (
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, id..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#5ed29c]"
                />
              </div>
            )}
          </div>

          {/* Table 1: Registered Users */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-4 font-semibold">Developer</th>
                    <th className="py-3 px-4 font-semibold">Contact / Email</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Logins</th>
                    <th className="py-3 px-4 font-semibold">Last Login</th>
                    <th className="py-3 px-4 font-semibold">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {(u.fullName || u.email || 'D').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{u.fullName || 'Developer'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {u.email || u.phone || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#159C63] dark:text-[#5ed29c] border border-emerald-500/20 text-[10px] font-bold uppercase font-mono">
                            {u.role || 'developer'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {u.loginCount || 1}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {u.lastLoginAt
                            ? new Date(u.lastLoginAt).toLocaleString('en-US', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table 2: Login Activity Logs */}
          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Auth Type</th>
                    <th className="py-3 px-4 font-semibold">IP Address</th>
                    <th className="py-3 px-4 font-semibold">User Agent / Client</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {authLogs.length > 0 ? (
                    authLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{log.userName || log.userEmail || log.userId}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.userId}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-mono font-bold uppercase">
                            {log.authType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                          {log.userAgent || 'Web Browser'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleString('en-US', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No authentication logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
