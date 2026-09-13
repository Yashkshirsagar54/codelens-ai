import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppBackground } from '../components/ui/AppBackground';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { CodeLensLogo } from '../components/CodeLensLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { HistorySidebar } from '../components/history/HistorySidebar';
import { CodeEditor } from '../components/editor/CodeEditor';
import { AnalysisResults } from '../components/review/AnalysisResults';
import { AiToolsModal } from '../components/tools/AiToolsModal';
import { ExportableAnalysis } from '../lib/exportUtils';
import {
  analyzeCode,
  getAnalysisHistory,
  deleteAnalysis,
  AnalysisRecord,
  AnalysisMode,
} from '../lib/apiClient';
import { fetchGitHubContent } from '../lib/githubImporter';
import {
  Sparkles,
  History,
  FileCode,
  Upload,
  User,
  LogOut,
  ChevronDown,
  Code2,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Github,
  ArrowRight,
  Wand2,
} from 'lucide-react';

const DEFAULT_SNIPPET = `// Welcome to CodeLens AI Workspace!
// Paste your TypeScript, Python, C++, Java, or JavaScript code here.

function calculateUserDiscount(user: any, cartTotal: number) {
  if (user.isPremium = true) { // Potential equality assignment bug
    return cartTotal * 0.20;
  }
  return 0;
}`;

/** Converts an API AnalysisRecord into the ExportableAnalysis shape used by the UI */
function recordToExportable(record: AnalysisRecord): ExportableAnalysis {
  return {
    id: record.id,
    language: record.language,
    mode: record.mode,
    overallScore: record.overallScore,
    summary: record.summary,
    issues: record.issues,
    strengths: record.strengths,
    refactoredCode: record.refactoredCode,
    generatedTests: record.generatedTests,
    metrics: record.metrics,
    code: record.code,
    createdAt: record.createdAt,
  };
}

export const DashboardPage: React.FC = () => {
  const { user, signOut, getToken } = useAuth();

  // User display info from Supabase / Clerk
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Developer';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const [mobileView, setMobileView] = useState<'code' | 'results'>('code');
  const [activeTab, setActiveTab] = useState<'editor' | 'upload' | 'github'>('editor');
  const [code, setCode] = useState<string>(DEFAULT_SNIPPET);
  const [language, setLanguage] = useState<string>('typescript');
  const [mode, setMode] = useState<AnalysisMode>('general');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [githubLoading, setGithubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<ExportableAnalysis | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  const [quota, setQuota] = useState<{ remaining: number; limit: number }>({ remaining: 20, limit: 20 });
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<ExportableAnalysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState<boolean>(true);

  // Auto-dismiss welcome toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcomeToast(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load analysis history from the API on mount
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await getAnalysisHistory(getToken);
      setHistoryItems(response.data.map(recordToExportable));
      setQuota(response.usage);
    } catch (err: any) {
      console.warn('Could not load history:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCode(event.target.result as string);
          setActiveTab('editor');
          showToast(`Imported ${file.name} successfully.`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGitHubImport = async () => {
    if (!githubUrl.trim() || githubLoading) return;
    setGithubLoading(true);
    setGithubError(null);

    try {
      const result = await fetchGitHubContent(githubUrl);
      setCode(result.code);
      if (result.language && result.language !== 'auto') {
        setLanguage(result.language);
      }
      setActiveTab('editor');
      showToast(`Imported ${result.filename} from GitHub.`);
    } catch (err: any) {
      setGithubError(err.message || 'Could not fetch GitHub resource.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setApiError(null);

    try {
      const detectedLang = language === 'auto' ? undefined : language;
      const response = await analyzeCode({ code, language: detectedLang, mode }, getToken);

      const exportable = recordToExportable(response.analysis);
      setCurrentAnalysis(exportable);
      setHistoryItems((prev) => [exportable, ...prev.filter((i) => i.id !== exportable.id)]);
      setQuota(response.usage);
      setMobileView('results');
      showToast(`Code analysis completed successfully.`);
    } catch (err: any) {
      setApiError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = (newCodeOrFix: string, targetLine?: number | null) => {
    if (targetLine && targetLine > 0) {
      // Surgical line replacement
      const lines = code.split('\n');
      if (targetLine <= lines.length) {
        lines[targetLine - 1] = newCodeOrFix;
        setCode(lines.join('\n'));
        showToast(`Applied fix to Line ${targetLine}.`);
        return;
      }
    }

    // Full refactor code replacement
    setCode(newCodeOrFix);
    showToast('Applied AI refactored code to editor.');
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteAnalysis(id, getToken);
      setHistoryItems((prev) => prev.filter((i) => i.id !== id));
      if (currentAnalysis?.id === id) setCurrentAnalysis(null);
      showToast('Review history item deleted.');
    } catch (err: any) {
      console.error('Failed to delete history item:', err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500/20">
      <AppBackground />
      <CodeFlowBackground />

      {/* Top Bar Navigation */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 border-b border-emerald-200/70 dark:border-white/10 flex items-center justify-between">
        <Link to="/" className="group">
          <CodeLensLogo size="sm" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-emerald-200/70 dark:border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#159C63] dark:bg-[#5ed29c] animate-pulse" />
            <span className="text-slate-600 dark:text-white/60">Daily Quota:</span>
            <span className="font-bold text-[#159C63] dark:text-[#5ed29c]">
              {quota.remaining} / {quota.limit}
            </span>
          </div>

          {/* AI Tools Suite Button */}
          <button
            type="button"
            onClick={() => setIsToolsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Tools</span>
          </button>

          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="min-h-[44px] sm:min-h-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-emerald-50/70 dark:hover:bg-white/10 border border-emerald-200/70 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
          >
            <History className="w-4 h-4 text-[#159C63] dark:text-[#5ed29c]" />
            <span className="hidden sm:inline">History</span>
            {historyItems.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#159C63]/20 dark:bg-[#5ed29c]/20 text-[#159C63] dark:text-[#5ed29c] text-[10px] font-mono font-bold">
                {historyItems.length}
              </span>
            )}
          </button>

          <ThemeToggle />

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 p-1 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-emerald-50/70 dark:hover:bg-white/10 border border-emerald-200/70 dark:border-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5ed29c] to-teal-600 flex items-center justify-center text-[#070b0a] font-bold text-xs">
                {userInitial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl space-y-1 z-30">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-sans truncate">{userName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate">{userEmail}</p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Workspace Switcher (< lg Viewports) */}
      <div className="lg:hidden relative z-10 max-w-7xl w-full mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 bg-white/60 dark:bg-white/5 p-1 rounded-xl border border-emerald-200/70 dark:border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMobileView('code')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg transition-colors ${
              mobileView === 'code'
                ? 'bg-[#5ed29c] text-[#070b0a]'
                : 'text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Code Input</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('results')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg transition-colors ${
              mobileView === 'results'
                ? 'bg-[#5ed29c] text-[#070b0a]'
                : 'text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Results {currentAnalysis && `(${currentAnalysis.issues.length})`}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Grid */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showWelcomeToast && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-900 dark:text-white flex items-center justify-between shadow-lg transition-all animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#159C63] dark:bg-[#5ed29c] text-[#070b0a] font-bold flex items-center justify-center text-sm shadow-md">
                ✓
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#159C63] dark:text-[#5ed29c]">
                  AUTHENTICATION SUCCESSFUL!
                </p>
                <p className="text-xs text-slate-600 dark:text-white/80 font-medium">
                  Welcome back, <span className="font-bold text-slate-900 dark:text-white">{userName}</span> ({userEmail})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcomeToast(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Code Input & Import Suite */}
          <div className={`lg:col-span-6 space-y-4 ${mobileView === 'code' ? 'block' : 'hidden lg:block'}`}>
            {/* Source Tab Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'editor' ? 'bg-[#159C63] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'upload' ? 'bg-[#159C63] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('github')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'github' ? 'bg-[#159C63] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub / PR Diff</span>
                </button>
              </div>

              {/* Tools Launcher shortcut */}
              <button
                type="button"
                onClick={() => setIsToolsModalOpen(true)}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-purple-500/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Explain / Translate</span>
              </button>
            </div>

            {/* Tab 1: Full CodeMirror Editor with Mode Selector */}
            {activeTab === 'editor' && (
              <CodeEditor
                code={code}
                onChange={setCode}
                language={language}
                onLanguageChange={setLanguage}
                mode={mode}
                onModeChange={setMode}
                onAnalyze={handleAnalyze}
                loading={loading}
                disabled={quota.remaining === 0}
              />
            )}

            {/* Tab 2: Upload File */}
            {activeTab === 'upload' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs dark:shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#159C63] dark:text-[#5ed29c] flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Source Code File</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    Supports .ts, .tsx, .js, .jsx, .py, .cpp, .java, .html, .css, and .json files.
                  </p>
                </div>
                <input type="file" onChange={handleFileUpload} className="hidden" id="file-upload-input" />
                <label
                  htmlFor="file-upload-input"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 text-white text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <span>Select File from Disk</span>
                </label>
              </div>
            )}

            {/* Tab 3: GitHub & PR Diff Importer */}
            {activeTab === 'github' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs dark:shadow-2xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import from GitHub or Git PR Diff</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Paste a public GitHub file URL, Gist link, commit URL, or Pull Request.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">GitHub URL / PR Diff Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/facebook/react/blob/main/packages/react/src/React.js"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:border-[#159C63] transition-colors"
                    />
                    <button
                      onClick={handleGitHubImport}
                      disabled={githubLoading || !githubUrl.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all shrink-0 cursor-pointer"
                    >
                      {githubLoading ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <span>Fetch Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Examples: <code className="text-slate-700 dark:text-slate-400 font-mono">github.com/owner/repo/blob/main/...</code>, Gists, or <code className="text-slate-700 dark:text-slate-400 font-mono">.../pull/42</code>
                  </p>

                  {githubError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{githubError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {apiError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="mt-0.5">{apiError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Review Results Report */}
          <div className={`lg:col-span-6 space-y-4 ${mobileView === 'results' ? 'block' : 'hidden lg:block'}`}>
            {currentAnalysis ? (
              <AnalysisResults analysis={currentAnalysis} onApplyFix={handleApplyFix} />
            ) : (
              <LiquidGlassCard className="p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px]">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#159C63]/10 dark:bg-[#5ed29c]/10 border border-[#159C63]/20 dark:border-[#5ed29c]/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#159C63] dark:text-[#5ed29c] animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No Review Generated Yet</h3>
                <p className="text-xs text-slate-600 dark:text-white/60 max-w-sm mt-1 leading-relaxed">
                  Select your desired analysis mode (<span className="font-semibold text-blue-400">Security</span>, <span className="font-semibold text-amber-400">Performance</span>, <span className="font-semibold text-purple-400">Refactoring</span>, or <span className="font-semibold text-cyan-400">Unit Tests</span>) on the left and click <span className="text-[#159C63] dark:text-[#5ed29c] font-bold">"ANALYZE CODE"</span>.
                </p>
              </LiquidGlassCard>
            )}
          </div>
        </div>
      </main>

      {/* AI Developer Tools Suite Modal */}
      <AiToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        code={code}
        language={language}
        onApplyCode={(newCode) => {
          setCode(newCode);
          showToast('Updated editor with generated code.');
        }}
        getToken={getToken}
      />

      {/* History Sidebar */}
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyItems}
        loading={historyLoading}
        onSelect={(item) => {
          setCode(item.code);
          if (item.language) setLanguage(item.language);
          if (item.mode) setMode(item.mode);
          setCurrentAnalysis(item);
          setMobileView('results');
          setHistoryOpen(false);
          showToast('Loaded review from history.');
        }}
        onDelete={handleDeleteHistory}
      />
    </div>
  );
};
