import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Check,
  Copy,
  Sparkles,
  Wand2,
  Download,
  Columns,
  ListFilter,
  ArrowRight,
  TrendingUp,
  FileCode,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  refactoredCode: string;
  language?: string;
  onApplyFix: (newCode: string) => void;
}

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  originalLineNumber?: number;
  refactoredLineNumber?: number;
  originalText?: string;
  refactoredText?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  originalCode,
  refactoredCode,
  language,
  onApplyFix,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [appliedToast, setAppliedToast] = useState<boolean>(false);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Synchronized scrolling for Split View
  const handleScroll = (source: 'left' | 'right') => {
    if (source === 'left' && leftPaneRef.current && rightPaneRef.current) {
      rightPaneRef.current.scrollTop = leftPaneRef.current.scrollTop;
    } else if (source === 'right' && leftPaneRef.current && rightPaneRef.current) {
      leftPaneRef.current.scrollTop = rightPaneRef.current.scrollTop;
    }
  };

  const originalLines = useMemo(() => originalCode.split('\n'), [originalCode]);
  const refactoredLines = useMemo(() => refactoredCode.split('\n'), [refactoredCode]);

  // Calculate detailed line-by-line diff matrix
  const { diffLines, stats } = useMemo(() => {
    const lines: DiffLine[] = [];
    let addedCount = 0;
    let removedCount = 0;
    let modifiedCount = 0;

    const maxLen = Math.max(originalLines.length, refactoredLines.length);

    for (let i = 0; i < maxLen; i++) {
      const orig = originalLines[i];
      const ref = refactoredLines[i];

      if (orig === undefined && ref !== undefined) {
        addedCount++;
        lines.push({
          type: 'added',
          refactoredLineNumber: i + 1,
          refactoredText: ref,
        });
      } else if (orig !== undefined && ref === undefined) {
        removedCount++;
        lines.push({
          type: 'removed',
          originalLineNumber: i + 1,
          originalText: orig,
        });
      } else if (orig === ref) {
        lines.push({
          type: 'unchanged',
          originalLineNumber: i + 1,
          refactoredLineNumber: i + 1,
          originalText: orig,
          refactoredText: ref,
        });
      } else {
        modifiedCount++;
        lines.push({
          type: 'modified',
          originalLineNumber: i + 1,
          refactoredLineNumber: i + 1,
          originalText: orig,
          refactoredText: ref,
        });
      }
    }

    return {
      diffLines: lines,
      stats: {
        added: addedCount,
        removed: removedCount,
        modified: modifiedCount,
        totalChanges: addedCount + removedCount + modifiedCount,
        originalTotal: originalLines.length,
        refactoredTotal: refactoredLines.length,
      },
    };
  }, [originalLines, refactoredLines]);

  if (!isOpen) return null;

  const handleCopyRefactored = () => {
    navigator.clipboard.writeText(refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFixedCode = () => {
    const extMap: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
    };
    const ext = extMap[language?.toLowerCase() || ''] || 'txt';
    const blob = new Blob([refactoredCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codelens_refactored_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    onApplyFix(refactoredCode);
    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl w-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-full max-w-full' : 'max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
                <span>Side-by-Side Live Diff &amp; AI Refactoring</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-emerald-400 font-mono border border-slate-700">
                  {language || 'TypeScript'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Inspect AI improvements, security patches, and optimizations line-by-line.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'split'
                    ? 'bg-gradient-to-r from-[#159C63] to-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-gradient-to-r from-[#159C63] to-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Unified View</span>
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diff Metrics Banner */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diff Summary:</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[11px]">
              +{stats.added} added
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-[11px]">
              ~{stats.modified} modified
            </span>
            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-mono font-bold text-[11px]">
              -{stats.removed} removed
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Original: <span className="text-slate-200">{stats.originalTotal} lines</span> <ArrowRight className="inline w-3 h-3 mx-1 text-slate-500" /> Refactored: <span className="text-emerald-400 font-bold">{stats.refactoredTotal} lines</span>
          </div>
        </div>

        {/* Diff Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/90 font-mono text-xs select-text">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Left Column: Original Code */}
              <div className="border border-red-900/30 rounded-2xl overflow-hidden bg-slate-900/90 flex flex-col shadow-inner">
                <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/40 text-red-300 font-sans text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Original Source ({originalLines.length} lines)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-mono">
                    Before Fix
                  </span>
                </div>
                <div
                  ref={leftPaneRef}
                  onScroll={() => handleScroll('left')}
                  className="p-3 overflow-auto max-h-[520px] leading-relaxed space-y-0.5"
                >
                  {diffLines.map((line, idx) => {
                    const isDiff = line.type === 'modified' || line.type === 'removed';
                    return (
                      <div
                        key={idx}
                        className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                          isDiff
                            ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500'
                            : line.originalText
                            ? 'text-slate-300 hover:bg-slate-800/30'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">
                          {line.originalLineNumber || ' '}
                        </span>
                        <span className="w-4 select-none font-bold text-red-400 shrink-0">
                          {isDiff ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre overflow-x-auto">
                          {line.originalText || ' '}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: AI Refactored & Optimized */}
              <div className="border border-emerald-900/40 rounded-2xl overflow-hidden bg-slate-900/90 flex flex-col shadow-inner">
                <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-900/40 text-emerald-300 font-sans text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI Refactored &amp; Fixed ({refactoredLines.length} lines)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                    Optimized
                  </span>
                </div>
                <div
                  ref={rightPaneRef}
                  onScroll={() => handleScroll('right')}
                  className="p-3 overflow-auto max-h-[520px] leading-relaxed space-y-0.5"
                >
                  {diffLines.map((line, idx) => {
                    const isDiff = line.type === 'modified' || line.type === 'added';
                    return (
                      <div
                        key={idx}
                        className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                          isDiff
                            ? 'bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500'
                            : line.refactoredText
                            ? 'text-slate-300 hover:bg-slate-800/30'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="w-8 select-none text-emerald-700 text-right pr-3 shrink-0">
                          {line.refactoredLineNumber || ' '}
                        </span>
                        <span className="w-4 select-none font-bold text-emerald-400 shrink-0">
                          {isDiff ? '+' : ' '}
                        </span>
                        <span className="whitespace-pre overflow-x-auto">
                          {line.refactoredText || ' '}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Unified Diff View */
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/90 p-4 space-y-1">
              <div className="text-slate-400 font-sans text-xs font-bold mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Unified Line-by-Line Comparison</span>
                <span className="text-[11px] text-emerald-400 font-mono">Green = AI Replacements</span>
              </div>
              <div className="max-h-[520px] overflow-auto space-y-0.5">
                {diffLines.map((line, idx) => {
                  if (line.type === 'modified') {
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex items-start px-2 py-0.5 rounded bg-red-500/10 text-red-300 border-l-2 border-red-500">
                          <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">
                            {line.originalLineNumber}
                          </span>
                          <span className="w-4 select-none font-bold text-red-400 shrink-0">-</span>
                          <span className="whitespace-pre overflow-x-auto">{line.originalText || ' '}</span>
                        </div>
                        <div className="flex items-start px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500">
                          <span className="w-8 select-none text-emerald-700 text-right pr-3 shrink-0">
                            {line.refactoredLineNumber}
                          </span>
                          <span className="w-4 select-none font-bold text-emerald-400 shrink-0">+</span>
                          <span className="whitespace-pre overflow-x-auto">{line.refactoredText || ' '}</span>
                        </div>
                      </React.Fragment>
                    );
                  }

                  if (line.type === 'added') {
                    return (
                      <div
                        key={idx}
                        className="flex items-start px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500"
                      >
                        <span className="w-8 select-none text-emerald-700 text-right pr-3 shrink-0">
                          {line.refactoredLineNumber}
                        </span>
                        <span className="w-4 select-none font-bold text-emerald-400 shrink-0">+</span>
                        <span className="whitespace-pre overflow-x-auto">{line.refactoredText || ' '}</span>
                      </div>
                    );
                  }

                  if (line.type === 'removed') {
                    return (
                      <div
                        key={idx}
                        className="flex items-start px-2 py-0.5 rounded bg-red-500/10 text-red-300 border-l-2 border-red-500"
                      >
                        <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">
                          {line.originalLineNumber}
                        </span>
                        <span className="w-4 select-none font-bold text-red-400 shrink-0">-</span>
                        <span className="whitespace-pre overflow-x-auto">{line.originalText || ' '}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="flex items-start px-2 py-0.5 rounded text-slate-300 hover:bg-slate-800/30">
                      <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">
                        {line.refactoredLineNumber || line.originalLineNumber}
                      </span>
                      <span className="w-4 select-none text-slate-600 shrink-0"> </span>
                      <span className="whitespace-pre overflow-x-auto">{line.refactoredText || line.originalText || ' '}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Clicking "Apply Fix to Editor" replaces your current editor code instantly.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFixedCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>

            <button
              onClick={handleCopyRefactored}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Solution' : 'Copy Solution'}</span>
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{appliedToast ? 'Applied Successfully!' : 'Apply Fix to Editor'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
