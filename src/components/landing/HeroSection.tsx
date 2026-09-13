import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Zap, Play } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useTheme } from '../../context/ThemeContext';

export const HeroSection: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isDesktopScreen, setIsDesktopScreen] = useState<boolean>(false);

  const videoUrl = import.meta.env.VITE_HERO_VIDEO_URL;

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktopScreen(window.innerWidth >= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    if (isDesktopScreen && videoUrl && videoRef.current && !prefersReducedMotion && theme === 'dark') {
      videoRef.current.play().catch(() => setVideoLoaded(false));
    }
  }, [isDesktopScreen, videoUrl, prefersReducedMotion, theme]);

  const highlights = [
    '20 Free Daily AI Reviews',
    'OWASP Vulnerability Audit',
    'Zero Setup Required',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="about" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-44 md:pb-36 overflow-hidden bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300 selection:bg-emerald-500/20">

      {/* Background Video Stream (Desktop/Tablet >= 768px in Dark Mode Only) */}
      {isDesktopScreen && videoUrl && !prefersReducedMotion && theme === 'dark' ? (
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-60' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-[#070b0a]/70" />
        </div>
      ) : (
        /* Animated Radial Glow Blobs Fallback for Light Theme / Mobile */
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }
            }
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] md:w-[750px] h-[350px] sm:h-[600px] md:h-[750px] bg-gradient-to-tr from-[#159C63]/10 dark:from-[#5ed29c]/20 via-teal-500/10 to-indigo-500/10 rounded-full blur-3xl"
          />
        </div>
      )}

      {/* Center-Top Ambient Focus Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-36 sm:h-48 bg-[#159C63]/15 dark:bg-[#5ed29c]/25 rounded-full blur-[90px] pointer-events-none z-0" />

      {/* Desktop Vertical Grid Overlay Lines */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-4 px-4 sm:px-6 lg:px-8">
          <div className="border-r border-slate-900/[0.05] dark:border-white/5 h-full" />
          <div className="border-r border-slate-900/[0.05] dark:border-white/5 h-full" />
          <div className="border-r border-slate-900/[0.05] dark:border-white/5 h-full" />
          <div className="h-full" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto pt-4 sm:pt-6"
        >
          {/* Main Headline with Light Cursive Typography */}
          <motion.h1
            variants={itemVariants}
            style={{ fontFamily: '"Instrument Serif", "Playfair Display", "Cormorant Garamond", Georgia, serif' }}
            className="italic text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] font-normal tracking-[-0.015em] text-slate-900 dark:text-white leading-[1.08] sm:leading-[1] select-none py-2"
          >
            <span className="inline-block relative">
              Smarter Code,
            </span>
            <br />
            <span className="relative inline-block mt-1 sm:mt-2">
              <span className="bg-gradient-to-r from-[#159C63] via-emerald-400 to-[#5ed29c] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(94,210,156,0.35)]">
                Better Reviews
              </span>
              <span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            variants={itemVariants}
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300/85 max-w-2xl mx-auto font-normal leading-relaxed md:leading-8 tracking-[-0.01em]"
          >
            Detect <span className="font-semibold text-slate-800 dark:text-white">security vulnerabilities</span>, optimize <span className="font-semibold text-slate-800 dark:text-white">runtime performance</span>, evaluate <span className="font-semibold text-slate-800 dark:text-white">Big-O complexity</span>, and generate comprehensive unit tests in <span className="font-semibold text-emerald-600 dark:text-[#5ed29c]">under 2 seconds</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider text-[#070b0a] bg-[#5ed29c] hover:bg-[#4ec28c] shadow-lg shadow-[#5ed29c]/25 hover:shadow-xl hover:shadow-[#5ed29c]/40 transition-all flex items-center justify-center gap-2 group"
              >
                <Zap className="w-4 h-4 fill-[#070b0a]" />
                <span>Start Reviewing Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <a
                href="#demo"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-white/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-emerald-200/70 dark:border-white/15 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#159C63] dark:text-[#5ed29c]" />
                <span>Live Interactive Demo</span>
              </a>
            </motion.div>
          </motion.div>

          {/* Feature Highlight Pills */}
          <motion.div
            variants={itemVariants}
            className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-white/60 font-medium"
          >
            {highlights.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159C63] dark:text-[#5ed29c]" />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
