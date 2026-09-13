import React, { useState } from 'react';
import { CodeIssue } from '@db/schema';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Copy, Check, Wand2 } from 'lucide-react';

interface IssueCardProps {
  issue: CodeIssue;
  index: number;
  onApplyFix?: (suggestion: string, line: number | null) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onApplyFix }: IssueCardProps) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
          icon: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
          label: 'High Severity',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
          icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
          label: 'Medium Severity',
        };
      case 'low':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
          icon: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
          label: 'Low Severity',
        };
    }
  };

  const badge = getSeverityBadge(issue.severity);

  const handleCopySuggestion = () => {
    navigator.clipboard.writeText(issue.suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {badge.icon}
          <div className="truncate">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{issue.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                {badge.label}
              </span>
              {issue.line && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  Line {issue.line}
                </span>
              )}
            </div>
          </div>
        </div>

        <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800/60 pt-3 space-y-3 bg-slate-50/50 dark:bg-transparent">
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description</h5>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{issue.description}</p>
          </div>

          {issue.suggestion && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h5 className="text-[10px] font-bold text-[#159C63] dark:text-[#5ed29c] uppercase tracking-wider">Recommended Fix</h5>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopySuggestion}
                    className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onApplyFix && (
                    <button
                      onClick={() => onApplyFix(issue.suggestion, issue.line)}
                      className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all font-bold cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Apply Fix</span>
                    </button>
                  )}
                </div>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 text-xs font-mono overflow-x-auto shadow-inner">
                <code>{issue.suggestion}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
