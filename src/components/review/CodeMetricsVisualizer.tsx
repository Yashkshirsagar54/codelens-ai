import React from 'react';
import { CodeMetrics } from '../../lib/apiClient';
import { getComplexityRating, getMaintainabilityRating } from '../../lib/metricsCalculator';
import { Activity, ShieldCheck, Zap, Cpu, FileCode2, MessageSquareCode, Gauge } from 'lucide-react';

interface CodeMetricsVisualizerProps {
  metrics: CodeMetrics;
}

export const CodeMetricsVisualizer: React.FC<CodeMetricsVisualizerProps> = ({ metrics }) => {
  const complexityRating = getComplexityRating(metrics.cyclomaticComplexity);
  const maintRating = getMaintainabilityRating(metrics.maintainabilityIndex);

  return (
    <div className="space-y-6">
      {/* Top 3 Primary Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Maintainability Index Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Maintainability
            </span>
            <span className={`text-xs font-bold ${maintRating.color}`}>{maintRating.label}</span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{metrics.maintainabilityIndex}</span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, metrics.maintainabilityIndex)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Higher score reflects easier refactoring and lower technical debt.</p>
        </div>

        {/* Cyclomatic Complexity Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              Cyclomatic Complexity
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${complexityRating.bg} ${complexityRating.color} ${complexityRating.borderColor}`}>
              {complexityRating.label}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{metrics.cyclomaticComplexity}</span>
              <span className="text-xs text-slate-500">decision paths</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, metrics.cyclomaticComplexity * 5)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{complexityRating.description}</p>
        </div>

        {/* Cognitive Load Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Cognitive Load
            </span>
            <span className="text-xs font-mono text-purple-400">Score {metrics.cognitiveLoad}</span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{metrics.cognitiveLoad}</span>
              <span className="text-xs text-slate-500">mental steps</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, metrics.cognitiveLoad * 6)}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Calculates the mental effort required for a developer to comprehend this code.</p>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Source Lines</div>
            <div className="text-lg font-bold text-slate-100 font-mono">{metrics.linesOfCode} LOC</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <MessageSquareCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Comments</div>
            <div className="text-lg font-bold text-slate-100 font-mono">{metrics.commentRatio}%</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Security Score</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{metrics.securityScore}/100</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Efficiency</div>
            <div className="text-lg font-bold text-amber-400 font-mono">{metrics.performanceScore}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
