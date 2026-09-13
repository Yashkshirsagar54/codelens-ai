import React from 'react';
import { ExportableAnalysis } from '../../lib/exportUtils';
import { formatDate } from '../../lib/utils';
import { History, Trash2, X, ChevronRight, Calendar, Loader2 } from 'lucide-react';

interface HistorySidebarProps {
  open: boolean;
  onClose: () => void;
  history: ExportableAnalysis[];
  loading: boolean;
  onSelect: (item: ExportableAnalysis) => void;
  onDelete: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  open,
  onClose,
  history,
  loading,
  onSelect,
  onDelete,
}: HistorySidebarProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-slate-900 dark:text-white">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#159C63] dark:text-[#5ed29c]" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Review History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono font-bold">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400 text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#159C63] dark:text-[#5ed29c]" />
              <span>Fetching past analyses...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs gap-2">
              <History className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              <p className="font-semibold text-slate-800 dark:text-slate-300">No review history yet</p>
              <p className="text-slate-500">Run your first AI code review to save records here.</p>
            </div>
          ) : (
            history.map((item: ExportableAnalysis) => (
              <div
                key={item.id}
                className="group relative bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-[#159C63]/40 dark:hover:border-[#5ed29c]/40 rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.overallScore >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-[#159C63] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                          : item.overallScore >= 60
                          ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30'
                      }`}
                    >
                      Score: {item.overallScore}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                      {item.language || 'Auto'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-300 truncate font-mono">{item.summary}</p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{item.createdAt ? formatDate(item.createdAt) : 'Recently'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.id) onDelete(item.id);
                    }}
                    title="Delete record"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-[#159C63] dark:group-hover:text-[#5ed29c] transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
