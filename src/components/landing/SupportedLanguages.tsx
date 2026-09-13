import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface LanguageItem {
  name: string;
  category: string;
  logoSrc: string;
  brandColor: string;
}

const LANGUAGES: LanguageItem[] = [
  {
    name: 'Python',
    category: 'FastAPI, Django & AI',
    logoSrc: '/logos/python.svg',
    brandColor: '#387EB8',
  },
  {
    name: 'TypeScript',
    category: 'Next.js & Node.js',
    logoSrc: '/logos/typescript.svg',
    brandColor: '#3178C6',
  },
  {
    name: 'JavaScript',
    category: 'Modern ES6+ & V8',
    logoSrc: '/logos/javascript.svg',
    brandColor: '#F7DF1E',
  },
  {
    name: 'React',
    category: 'Components & Hooks',
    logoSrc: '/logos/react.svg',
    brandColor: '#61DAFB',
  },
  {
    name: 'Java',
    category: 'Spring Boot & JVM',
    logoSrc: '/logos/java.svg',
    brandColor: '#E76F00',
  },
  {
    name: 'C++',
    category: 'Modern C++20 & Systems',
    logoSrc: '/logos/cpp.svg',
    brandColor: '#00599C',
  },
  {
    name: 'Go',
    category: 'Goroutines & Microservices',
    logoSrc: '/logos/golang.svg',
    brandColor: '#00ADD8',
  },
  {
    name: 'Rust',
    category: 'Memory Safety & Tokio',
    logoSrc: '/logos/rust.svg',
    brandColor: '#DEA584',
  },
  {
    name: 'C#',
    category: '.NET 8 & ASP.NET',
    logoSrc: '/logos/csharp.svg',
    brandColor: '#9B4F96',
  },
  {
    name: 'PHP',
    category: 'Laravel & Web APIs',
    logoSrc: '/logos/php.svg',
    brandColor: '#777BB4',
  },
  {
    name: 'Ruby',
    category: 'Rails & Architecture',
    logoSrc: '/logos/ruby.svg',
    brandColor: '#CC342D',
  },
  {
    name: 'Kotlin',
    category: 'Android & Jetpack',
    logoSrc: '/logos/kotlin.svg',
    brandColor: '#7F52FF',
  },
  {
    name: 'Swift',
    category: 'SwiftUI & Apple iOS',
    logoSrc: '/logos/swift.svg',
    brandColor: '#F05138',
  },
  {
    name: 'PostgreSQL',
    category: 'SQL & Query Optimizer',
    logoSrc: '/logos/postgresql.svg',
    brandColor: '#336791',
  },
  {
    name: 'Docker',
    category: 'Containers & Multi-Stage',
    logoSrc: '/logos/docker.svg',
    brandColor: '#2496ED',
  },
];

export const SupportedLanguages: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  // Triple items array for continuous unbroken infinite marquee
  const marqueeItems = [...LANGUAGES, ...LANGUAGES, ...LANGUAGES];

  return (
    <section id="languages" className="relative py-16 sm:py-20 overflow-hidden bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
          UNIVERSAL MULTI-LANGUAGE AST ENGINE
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
          SUPPORTED LANGUAGES &amp; FRAMEWORKS<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
        </h2>
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-white/70 max-w-xl mx-auto font-normal">
          Instant deep AST parsing, OWASP security checks, and refactoring recommendations across major developer stacks.
        </p>
      </div>

      {/* Floating Logos Marquee Container */}
      <div
        className="relative w-full overflow-hidden py-6 cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => setIsPaused(!isPaused)}
      >
        {/* Left & Right Smooth Gradient Fade Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-slate-50 dark:from-[#070b0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-slate-50 dark:from-[#070b0a] to-transparent z-10 pointer-events-none" />

        {/* Slow, Elegant Continuous Motion Track with pure floating logos */}
        <motion.div
          animate={
            prefersReducedMotion || isPaused
              ? { x: 0 }
              : { x: ['0%', '-33.333%'] }
          }
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 55,
              ease: 'linear',
            },
          }}
          className="flex items-center gap-10 sm:gap-14 w-max will-change-transform transform-gpu px-4"
        >
          {marqueeItems.map((lang, index) => (
            <motion.div
              key={`${lang.name}-${index}`}
              whileHover={{ scale: 1.15, y: -6 }}
              className="flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
            >
              {/* Pure Floating Logo */}
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300">
                {/* Subtle Ambient Radial Glow on Hover */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: lang.brandColor }}
                />

                <img
                  src={lang.logoSrc}
                  alt={`${lang.name} logo`}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300"
                  loading="lazy"
                />
              </div>

              {/* Language Name Tag */}
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-[#159C63] dark:group-hover:text-[#5ed29c] transition-colors font-sans">
                  {lang.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5">
                  {lang.category}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
