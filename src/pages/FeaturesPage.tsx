import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import {
  ShieldAlert,
  Zap,
  Wand2,
  FlaskConical,
  GitCompare,
  Activity,
  Languages,
  BookOpen,
  FileCode2,
  Download,
  Github,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Features — CodeLens AI Automated Code Intelligence Suite';
  }, []);

  const featureCards = [
    {
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
      tag: 'Security & Vulnerabilities',
      title: 'OWASP Security Audit & Vulnerability Scanner',
      desc: 'Detects SQL/NoSQL injection, insecure crypto, hardcoded secrets, prototype pollution, memory unsafe operations, and XSS risks with actionable patch code.',
    },
    {
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      tag: 'Code Metrics',
      title: 'Cyclomatic Complexity & Maintainability Index',
      desc: 'Real-time computation of branching complexity, cognitive load, LOC/comment ratios, and 0-100 maintainability scoring to prevent technical debt.',
    },
    {
      icon: <GitCompare className="w-6 h-6 text-emerald-400" />,
      tag: 'Refactoring',
      title: 'Interactive Side-by-Side Diff & One-Click Fix',
      desc: 'Inspect split or unified diffs comparing your original code with AI-refactored recommendations. Apply individual line fixes or full refactors with 1 click.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      tag: 'Code Intelligence',
      title: 'Context-Aware AI Code Assistant',
      desc: 'An AI Senior Engineer assistant that directly inspects your active editor code, breaks down logic line-by-line, and explains complex algorithms.',
    },
    {
      icon: <Languages className="w-6 h-6 text-purple-400" />,
      tag: 'Multi-Language',
      title: 'Cross-Language Code Translator',
      desc: 'Instantly convert algorithms and data structures between TypeScript, JavaScript, Python, C++, Java, Go, and Rust with type preservation.',
    },
    {
      icon: <FlaskConical className="w-6 h-6 text-cyan-400" />,
      tag: 'Testing',
      title: 'Automated Vitest / Pytest Test Suite Generator',
      desc: 'Generate complete, production-ready unit test suites covering standard happy paths, edge boundaries, null safety, and error rejections.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
      tag: 'Documentation',
      title: 'AI Plain-English Code Explainer',
      desc: 'Step-by-step walkthroughs of convoluted logic, asynchronous state mutations, and unfamiliar open source codebases.',
    },
    {
      icon: <FileCode2 className="w-6 h-6 text-indigo-400" />,
      tag: 'Standards',
      title: 'Docstring & JSDoc Auto-Generator',
      desc: 'Enrich functions with standardized parameter types, return signatures, and method descriptions adhering to JSDoc and Python PEP 257.',
    },
    {
      icon: <Github className="w-6 h-6 text-slate-300" />,
      tag: 'Integration',
      title: 'GitHub Repo & Pull Request Diff Importer',
      desc: 'Paste public GitHub file URLs, Gists, or PR diff links to review multi-file patches without leaving your browser.',
    },
    {
      icon: <Download className="w-6 h-6 text-emerald-400" />,
      tag: 'Export',
      title: 'Branded Executive PDF & Markdown Reports',
      desc: 'Export comprehensive audit summaries for stakeholders and pull request comments in PDF, Markdown, and JSON formats.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white selection:bg-[#5ed29c]/20 overflow-x-hidden transition-colors duration-300">
      <CodeFlowBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Feature Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Every AI Tool You Need for <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Flawless Code Delivery
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            From automated security audits and Big-O complexity calculations to instant cross-language translation and AI pair-programming copilot.
          </p>

          <div className="pt-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>Try in Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureCards.map((feat, idx) => (
            <motion.div key={idx} variants={cardVariants} whileHover={{ y: -6 }}>
              <LiquidGlassCard className="p-6 space-y-4 flex flex-col justify-between h-full group hover:border-[#5ed29c]/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#159C63] dark:group-hover:text-[#5ed29c] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{feat.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-xs text-blue-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live in Workspace</span>
                </div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default FeaturesPage;
