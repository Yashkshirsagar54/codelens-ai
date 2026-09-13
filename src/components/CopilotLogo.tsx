import React from 'react';

interface CopilotLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export const CopilotLogo: React.FC<CopilotLogoProps> = ({
  size = 'md',
  animated = true,
  className = '',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs':
        return { box: 'w-4 h-4', iconSize: 16 };
      case 'sm':
        return { box: 'w-5 h-5', iconSize: 20 };
      case 'md':
        return { box: 'w-7 h-7', iconSize: 28 };
      case 'lg':
        return { box: 'w-10 h-10', iconSize: 40 };
      case 'xl':
        return { box: 'w-14 h-14', iconSize: 56 };
    }
  };

  const { box, iconSize } = getDimensions();

  return (
    <div className={`relative inline-flex items-center justify-center ${box} ${className}`}>
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 opacity-60 blur-xs ${
          animated ? 'animate-pulse' : ''
        }`}
      />

      {/* SVG Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-sm"
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="copilotCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Glowing Ring Gradient */}
          <linearGradient id="copilotRing" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Inner Light */}
          <radialGradient id="opticGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#93C5FD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Shell */}
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="url(#copilotCore)"
          stroke="url(#copilotRing)"
          strokeWidth="1.5"
        />

        {/* Reticle */}
        <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
        
        {/* Optic Pupil */}
        <circle cx="24" cy="24" r="8" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="5" fill="url(#opticGlow)" />
        <circle cx="22" cy="22" r="1.5" fill="#FFFFFF" />

        {/* Nodes */}
        <circle cx="12" cy="16" r="1.5" fill="#34D399" />
        <circle cx="36" cy="32" r="1.5" fill="#60A5FA" />
        <circle cx="34" cy="14" r="1.5" fill="#A78BFA" />

        {/* Crosshairs */}
        <line x1="24" y1="7" x2="24" y2="11" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="37" x2="24" y2="41" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="24" x2="11" y2="24" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="37" y1="24" x2="41" y2="24" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
