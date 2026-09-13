import React, { useState } from 'react';
import { ScoreGauge } from './ScoreGauge';
import { IssueCard } from './IssueCard';
import { CodeMetricsVisualizer } from './CodeMetricsVisualizer';
import { DiffViewerModal } from './DiffViewerModal';
import { ExportableAnalysis, exportToPdf, exportToMarkdown, exportToJson } from '../../lib/exportUtils';
import { CodeIssue } from '@db/schema';
import {
  CheckCircle2,
  ShieldAlert,
  Download,
  FileText,
  FileCode,
  Layers,
  Activity,
  GitCompare,
  FlaskConical,
  Copy,
  Check,
  Wand2,
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: ExportableAnalysis;
  onApplyFix?: (newCodeOrFix: string, line?: number | null) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, onApplyFix }) => {
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics' | 'diff' | 'tests'>('issues');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [testsCopied, setTestsCopied] = useState<boolean>(false);
  const [refactoredCopied, setRefactoredCopied] = useState<boolean>(false);

  const filteredIssues = (analysis.issues || []).filter(
    (issue: CodeIssue) => filterSeverity === 'all' || issue.severity === filterSeverity
  );

  const highCount = (analysis.issues || []).filter((i: CodeIssue) => i.severity === 'high').length;
  const mediumCount = (analysis.issues || []).filter((i: CodeIssue) => i.severity === 'medium').length;
  const lowCount = (analysis.issues || []).filter((i: CodeIssue) => i.severity === 'low').length;

  const handleCopyTests = () => {
    if (analysis.generatedTests) {
      navigator.clipboard.writeText(analysis.generatedTests);
      setTestsCopied(true);
      setTimeout(() => setTestsCopied(false), 2000);
    }
  };

  const handleCopyRefactored = () => {
    if (analysis.refactoredCode) {
      navigator.clipboard.writeText(analysis.refactoredCode);
      setRefactoredCopied(true);
      setTimeout(() => setRefactoredCopied(false), 2000);
    }
  };

  const handleApplyFullRefactor = () => {
    if (analysis.refactoredCode && onApplyFix) {
      onApplyFix(analysis.refactoredCode);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs dark:shadow-2xl p-6 space-y-6 transition-colors">
      {/* Top Header & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>AI Code Review Report</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#159C63] dark:text-[#5ed29c] border border-emerald-500/20 font-mono uppercase font-bold">
              {analysis.language || 'Auto'}
            </span>
            {analysis.mode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium capitalize">
                {analysis.mode} Mode
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated Gemini static analysis &amp; security inspection</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToPdf(analysis)}
            title="Download Executive Audit PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-red-500" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={() => exportToMarkdown(analysis)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Markdown</span>
          </button>

          <button
            onClick={() => exportToJson(analysis)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'issues'
              ? 'bg-[#159C63] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Issues &amp; Overview ({analysis.issues?.length || 0})</span>
        </button>

        {analysis.metrics && (
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'metrics'
                ? 'bg-[#159C63] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Code Metrics</span>
          </button>
        )}

        {analysis.refactoredCode && (
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-[#159C63] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Refactored Diff</span>
          </button>
        )}

        {analysis.generatedTests && (
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-[#159C63] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Unit Tests</span>
          </button>
        )}
      </div>

      {/* Tab 1: Issues & Overview */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="md:col-span-1 flex justify-center">
              <ScoreGauge score={analysis.overallScore} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#159C63] dark:text-[#5ed29c]" />
                Executive Summary
              </h3>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{analysis.summary}</p>
            </div>
          </div>

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="bg-emerald-50/60 dark:bg-slate-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-slate-800/60 space-y-2">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Observed Code Strengths
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800 shadow-xs">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Identified Issues</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {analysis.issues?.length || 0}
                </span>
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setFilterSeverity('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    filterSeverity === 'all' ? 'bg-[#159C63] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  All ({analysis.issues?.length || 0})
                </button>
                <button
                  onClick={() => setFilterSeverity('high')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    filterSeverity === 'high' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-red-600'
                  }`}
                >
                  High ({highCount})
                </button>
                <button
                  onClick={() => setFilterSeverity('medium')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    filterSeverity === 'medium' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                  }`}
                >
                  Med ({mediumCount})
                </button>
                <button
                  onClick={() => setFilterSeverity('low')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    filterSeverity === 'low' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                  }`}
                >
                  Low ({lowCount})
                </button>
              </div>
            </div>

            {filteredIssues.length > 0 ? (
              <div className="space-y-3">
                {filteredIssues.map((issue: CodeIssue, index: number) => (
                  <IssueCard
                    key={index}
                    issue={issue}
                    index={index}
                    onApplyFix={(suggestion, line) => {
                      if (onApplyFix) onApplyFix(suggestion, line);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-xs">
                No issues match the selected severity filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Code Metrics Visualizer */}
      {activeTab === 'metrics' && analysis.metrics && (
        <div className="space-y-4">
          <CodeMetricsVisualizer metrics={analysis.metrics} />
        </div>
      )}

      {/* Tab 3: Refactored Diff */}
      {activeTab === 'diff' && analysis.refactoredCode && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full AI Code Refactoring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Integrated patch addressing all identified warnings and optimization opportunities.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDiffModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-[#159C63] hover:text-white dark:text-[#5ed29c] border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Side-by-Side Diff</span>
              </button>

              <button
                onClick={handleCopyRefactored}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                {refactoredCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{refactoredCopied ? 'Copied' : 'Copy'}</span>
              </button>

              {onApplyFix && (
                <button
                  onClick={handleApplyFullRefactor}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Apply to Editor</span>
                </button>
              )}
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[450px] shadow-inner">
            <code>{analysis.refactoredCode}</code>
          </pre>
        </div>
      )}

      {/* Tab 4: Generated Unit Tests */}
      {activeTab === 'tests' && analysis.generatedTests && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated Unit &amp; Integration Test Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production-ready test suite covering happy paths, edge boundaries, and error handlers.</p>
            </div>

            <button
              onClick={handleCopyTests}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {testsCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{testsCopied ? 'Copied Test Suite' : 'Copy Test Suite'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[450px] shadow-inner">
            <code>{analysis.generatedTests}</code>
          </pre>
        </div>
      )}

      {/* Diff Viewer Modal */}
      {analysis.refactoredCode && (
        <DiffViewerModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          originalCode={analysis.code}
          refactoredCode={analysis.refactoredCode}
          language={analysis.language || undefined}
          onApplyFix={(newCode) => {
            if (onApplyFix) onApplyFix(newCode);
          }}
        />
      )}
    </div>
  );
};
