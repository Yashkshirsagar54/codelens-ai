import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 140 }: ScoreGaugeProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#159C63';
  let glowColor = 'rgba(21, 156, 99, 0.3)';
  let gradeText = 'Good';

  if (score >= 80) {
    strokeColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.35)';
    gradeText = 'Production Ready';
  } else if (score >= 60) {
    strokeColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.35)';
    gradeText = 'Needs Refactoring';
  } else {
    strokeColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.35)';
    gradeText = 'Critical Issues';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{score}</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest -mt-1">
            out of 100
          </span>
        </div>
      </div>

      <span
        className="mt-2 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
        style={{
          color: strokeColor,
          backgroundColor: `${strokeColor}15`,
          border: `1px solid ${strokeColor}35`,
        }}
      >
        {gradeText}
      </span>
    </div>
  );
};
