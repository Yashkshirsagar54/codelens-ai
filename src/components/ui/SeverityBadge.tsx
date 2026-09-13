import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export type SeverityType = 'critical' | 'warning' | 'passed';

interface SeverityBadgeProps {
  severity: SeverityType;
  label?: string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  label,
  className = '',
}) => {
  const styles = {
    critical: {
      bg: 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300 shadow-sm shadow-red-500/10 dark:shadow-red-500/20',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />,
      defaultLabel: 'Critical Vulnerability',
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 shadow-sm shadow-amber-500/10 dark:shadow-amber-500/20',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />,
      defaultLabel: 'Style & Performance Warning',
    },
    passed: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-500/50 text-[#159C63] dark:text-emerald-300 shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#159C63] dark:text-emerald-400 shrink-0" />,
      defaultLabel: 'Passed Quality Audit',
    },
  }[severity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border backdrop-blur-md transition-all duration-200 hover:scale-105 ${styles.bg} ${className}`}
    >
      {styles.icon}
      <span>{label || styles.defaultLabel}</span>
    </span>
  );
};
