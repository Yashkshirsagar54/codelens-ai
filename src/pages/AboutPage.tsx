import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';
import { LiquidGlassCard } from '../components/ui/LiquidGlassCard';
import { CodeLensLogo } from '../components/CodeLensLogo';
import {
  ShieldCheck,
  Zap,
  Cpu,
  Lock,
  Terminal,
  Code2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  GitBranch,
  Server,
  Database,
  Workflow,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About CodeLens AI — Next-Gen AI Code Intelligence & Security';
  }, []);

  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Security-First Architecture',
      description:
        'Continuous deep scanning for OWASP Top 10 vulnerabilities, injection flaws, unsafe deserialization, and hardcoded credentials before code ever reaches production.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Sub-Second Static & AI Inference',
      description:
        'Hybrid dual-engine architecture combines deterministic AST static analysis with Google Gemini LLMs for instant, low-latency code review and refactoring.',
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-400" />,
      title: 'Zero-Telemetry Code Privacy',
      description:
        'Your proprietary source code is never used to train public foundation models. All reviews are isolated, encrypted in transit with TLS 1.3, and ephemeral.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-400" />,
      title: 'Multi-Language Ecosystem',
      description:
        'Native syntax and architectural review models across TypeScript, JavaScript, Python, C++, Java, Rust, and Go with automated test generation.',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Code Ingestion & Lexing',
      desc: 'Source code is ingested via CodeMirror editor, GitHub URL, Git PR diff, or file upload with automated language detection.',
      icon: <Terminal className="w-5 h-5 text-blue-400" />,
    },
    {
      step: '02',
      title: 'Deterministic Static AST Engine',
      desc: 'AST parsers calculate cyclomatic complexity, cognitive load, maintainability index, and check against static security rules.',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: '03',
      title: 'Gemini AI Deep Reasoning',
      desc: 'Multi-mode prompts inspect edge cases, generate line-by-line refactorings, and produce runnable unit test suites.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    },
    {
      step: '04',
      title: 'Side-by-Side Diff & One-Click Fix',
      desc: 'Developers review visual line diffs and apply surgical fixes directly into the live editor or export executive PDF/Markdown reports.',
      icon: <Workflow className="w-5 h-5 text-cyan-400" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white selection:bg-[#5ed29c]/20 overflow-x-hidden transition-colors duration-300">
      <CodeFlowBackground />
      <LandingNavbar />

      <main className="relative z-10 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-5 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission & Technology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Building the Standard in <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Next-Gen AI Code Quality
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            CodeLens AI is engineered to give software engineering teams an unfair advantage. We blend deterministic static analysis with cutting-edge Gemini reasoning to catch bugs, eliminate vulnerabilities, and refactor code in real-time.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/features"
                className="px-6 py-3 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold transition-colors"
              >
                <span>Explore Features</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* 4 Core Pillars */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-2 max-w-xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Engineering Principles</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Designed from the ground up for developer ergonomics, speed, and privacy.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {pillars.map((pillar, idx) => (
              <motion.div key={idx} variants={itemVariants} whileHover={{ y: -4 }}>
                <LiquidGlassCard className="p-6 space-y-3 h-full">
                  <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{pillar.description}</p>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Technical Architecture Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8 bg-slate-900/40 p-8 sm:p-12 rounded-3xl border border-slate-800 backdrop-blur-xl"
        >
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Workflow className="w-6 h-6 text-blue-400" />
              <span>How CodeLens AI Works</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              A high-precision pipeline designed for sub-second developer feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">{step.icon}</div>
                  <span className="text-xl font-mono font-black text-slate-700">{step.step}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4 text-center"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Built With Modern Standards</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            {['React 18', 'TypeScript', 'Tailwind CSS', 'CodeMirror', 'Google Gemini AI', 'Express & Vercel Functions', 'Drizzle ORM', 'Supabase', 'Sentry'].map(
              (tech, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05, y: -1 }}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300"
                >
                  {tech}
                </motion.span>
              )
            )}
          </div>
        </motion.div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default AboutPage;
