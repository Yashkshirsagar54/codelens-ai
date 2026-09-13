import React, { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import {
  FileCode2,
  Play,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  Wand2,
  FlaskConical,
  Layers,
  Activity,
} from 'lucide-react';
import { AnalysisMode } from '../../lib/apiClient';
import { calculateClientMetrics, getComplexityRating } from '../../lib/metricsCalculator';
import { useTheme } from '../../context/ThemeContext';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  onAnalyze: () => void;
  loading: boolean;
  disabled?: boolean;
}

const CODE_PRESETS: Record<string, { label: string; language: string; snippet: string }> = {
  ts_security: {
    label: 'TypeScript Security Flaw',
    language: 'typescript',
    snippet: `import express from 'express';
import { db } from './db';

const app = express();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const user = await db.query(query);
  if (!user) return res.status(401).send('Invalid login');
  res.json({ token: 'hardcoded-secret-12345', userId: user.id });
});`,
  },
  py_performance: {
    label: 'Python Performance & Memory Bug',
    language: 'python',
    snippet: `import time

def process_large_dataset(records):
    duplicates = []
    for item in records:
        if records.count(item) > 1 and item not in duplicates:
            duplicates.append(item)
            
    f = open("log.txt", "w")
    f.write(f"Found {len(duplicates)} duplicates")
    return duplicates`,
  },
  react_state: {
    label: 'React State Async Bug',
    language: 'javascript',
    snippet: `import React, { useState, useEffect } from 'react';

export function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/user/' + userId)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  return <div>{loading ? 'Loading...' : user?.name}</div>;
}`,
  },
};

const ANALYSIS_MODES: { id: AnalysisMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { id: 'general', label: 'General Review', icon: <Layers className="w-3.5 h-3.5" />, tooltip: 'Holistic review of bugs, types, and quality' },
  { id: 'security', label: 'Security Audit', icon: <ShieldAlert className="w-3.5 h-3.5" />, tooltip: 'Deep audit for OWASP vulnerabilities & injection flaws' },
  { id: 'performance', label: 'Performance', icon: <Zap className="w-3.5 h-3.5" />, tooltip: 'Detect bottlenecks, memory leaks & O(N^2) loops' },
  { id: 'refactor', label: 'Refactor', icon: <Wand2 className="w-3.5 h-3.5" />, tooltip: 'Clean architecture, SOLID patterns & full code rewrite' },
  { id: 'testgen', label: 'Generate Tests', icon: <FlaskConical className="w-3.5 h-3.5" />, tooltip: 'Auto-generate comprehensive unit test suites' },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  mode,
  onModeChange,
  onAnalyze,
  loading,
  disabled,
}: CodeEditorProps) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState<boolean>(false);

  const estimatedMetrics = useMemo(() => {
    return calculateClientMetrics(code);
  }, [code]);

  const complexityRating = getComplexityRating(estimatedMetrics.cyclomaticComplexity);

  const extensions = useMemo(() => {
    switch (language) {
      case 'typescript':
      case 'javascript':
      case 'jsx':
      case 'tsx':
        return [javascript({ jsx: true, typescript: true })];
      case 'python':
        return [python()];
      case 'cpp':
      case 'c':
        return [cpp()];
      case 'java':
        return [java()];
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'json':
        return [json()];
      default:
        return [javascript({ jsx: true, typescript: true })];
    }
  }, [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = CODE_PRESETS[presetKey];
    if (preset) {
      onLanguageChange(preset.language);
      onChange(preset.snippet);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs dark:shadow-2xl transition-colors">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-600 dark:text-[#5ed29c]" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Source Code</span>
          </div>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 outline-hidden focus:border-[#159C63] dark:focus:border-[#5ed29c] transition-colors"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Complexity Live Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs">
            <Activity className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Complexity:</span>
            <span className={`font-bold font-mono ${complexityRating.color}`}>
              {estimatedMetrics.cyclomaticComplexity} ({complexityRating.label})
            </span>
          </div>

          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handlePresetSelect(e.target.value);
              e.target.value = '';
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1.5 outline-hidden hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <option value="" disabled>
              ⚡ Load Sample Snippet
            </option>
            {Object.entries(CODE_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            title="Copy code snippet"
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mode Selection Pill Bar */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Review Mode:
        </span>
        <div className="flex items-center gap-1.5">
          {ANALYSIS_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              title={m.tooltip}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                mode === m.id
                  ? 'bg-gradient-to-r from-[#159C63] to-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CodeMirror Surface */}
      <div className="flex-1 min-h-[360px] max-h-[580px] overflow-auto text-sm font-mono bg-white dark:bg-slate-950">
        <CodeMirror
          value={code}
          height="100%"
          minHeight="360px"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={extensions}
          onChange={(value: string) => onChange(value)}
          className="text-sm font-mono outline-hidden"
        />
      </div>

      {/* Footer Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="text-[11px] text-slate-500 font-mono">
          <span>{code.length.toLocaleString()} / 20,000 characters</span>
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading || !code.trim() || disabled}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Code ({mode.toUpperCase()})...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
