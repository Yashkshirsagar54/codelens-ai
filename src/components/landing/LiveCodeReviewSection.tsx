import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, CheckCircle2, AlertTriangle, Copy, Check, Terminal, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { SeverityBadge } from '../ui/SeverityBadge';
import { Button } from '../ui/Button';

interface SampleBug {
  id: string;
  name: string;
  language: string;
  description: string;
  code: string;
  score: number;
  securityRisk: 'critical' | 'warning';
  aiRationale: string;
  refactoredCode: string;
}

const SAMPLE_BUGS: SampleBug[] = [
  {
    id: 'sql-injection',
    name: 'SQL Injection Vulnerability',
    language: 'TypeScript / Node',
    description: 'Raw string concatenation in SQL query allows unauthenticated data extraction.',
    code: `async function getUserProfile(userId: string) {
  // VULNERABLE: Direct string interpolation in SQL query
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  const user = await db.query(query);
  return user;
}`,
    score: 34,
    securityRisk: 'critical',
    aiRationale: 'Critical OWASP A03 SQL Injection vulnerability detected. User input is concatenated directly into the SQL string without sanitization or parameterization.',
    refactoredCode: `async function getUserProfile(userId: string) {
  // SECURE: Parameterized SQL query blocks SQL Injection
  const query = 'SELECT id, username, email FROM users WHERE id = ?';
  const [user] = await db.query(query, [userId]);
  return user ?? null;
}`,
  },
  {
    id: 'python-n2',
    name: 'O(N²) Quadratic Bottleneck',
    language: 'Python 3.11',
    description: 'Repeated list.count() inside comprehension creates an accidental O(N²) time bottleneck.',
    code: `def find_duplicates(items: list) -> list:
    # INEFFICIENT: list.count() runs O(N) for every single item -> O(N^2) total
    return [item for item in items if items.count(item) > 1]`,
    score: 52,
    securityRisk: 'warning',
    aiRationale: 'Performance bottleneck detected. Calling list.count() inside a list comprehension results in quadratic time complexity (O(N²)) for large arrays.',
    refactoredCode: `def find_duplicates(items: list) -> list:
    # OPTIMIZED: Hash Set tracking runs in linear O(N) time
    seen, duplicates = set(), set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return list(duplicates)`,
  },
];

export const LiveCodeReviewSection: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [activeBugId, setActiveBugId] = useState<string>('sql-injection');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const activeBug = SAMPLE_BUGS.find((b) => b.id === activeBugId) || SAMPLE_BUGS[0];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 850);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeBug.refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-20 md:py-28 bg-transparent text-slate-800 dark:text-white select-none transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            INTERACTIVE AI DEMO
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            SEE HOW CODELENS AI FINDS &amp; FIXES BUGS LIVE<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-white/70 font-normal">
            Select a sample code vulnerability below and click "Run AI Review" to witness instant AST parsing and automated refactoring.
          </p>
        </motion.div>

        {/* Bug Selection Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {SAMPLE_BUGS.map((bug) => (
            <motion.button
              key={bug.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveBugId(bug.id);
                setIsAnalyzing(false);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                activeBugId === bug.id
                  ? 'bg-[#159C63] dark:bg-[#5ed29c] text-white dark:text-[#070b0a] border-transparent shadow-md shadow-[#159C63]/25'
                  : 'bg-white/90 dark:bg-white/5 text-slate-700 dark:text-white/70 border-slate-300/80 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20'
              }`}
            >
              {bug.id === 'sql-injection' ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
              <span>{bug.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Interactive Code Comparison Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Original Code Editor Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between relative">
            {/* Scanning radar laser overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5ed29c] to-transparent shadow-[0_0_15px_#5ed29c] z-30 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2 font-medium">
                  {activeBug.language} (Original Code)
                </span>
              </div>

              <SeverityBadge severity={activeBug.securityRisk} />
            </div>

            <div className="p-5 font-mono text-xs overflow-x-auto flex-1 bg-slate-900/90">
              <pre className="text-slate-200 leading-relaxed font-mono">
                <code>{activeBug.code}</code>
              </pre>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-400">{activeBug.description}</p>
              <Button
                variant="primary"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="shrink-0 font-bold px-3.5 py-1.5 text-xs bg-[#5ed29c] hover:bg-[#4ec28c] text-[#070b0a]"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run AI Review</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right: AI Refactored Solution & Quality Score */}
          <div className="rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5ed29c]" />
                <span className="text-xs font-bold text-[#5ed29c]">
                  AI Patched &amp; Optimized Solution
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Health Score:
                </span>
                <span className="text-xs font-mono font-black text-[#5ed29c] px-2 py-0.5 rounded-md bg-[#5ed29c]/15 border border-[#5ed29c]/30">
                  98 / 100
                </span>
              </div>
            </div>

            <div className="p-5 font-mono text-xs overflow-x-auto flex-1 bg-slate-900/90">
              <pre className="text-emerald-300 leading-relaxed font-mono">
                <code>{activeBug.refactoredCode}</code>
              </pre>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-[#5ed29c] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AI Senior Engineer Recommendation</span>
                </p>
                <p className="text-[11px] text-slate-400">{activeBug.aiRationale}</p>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
