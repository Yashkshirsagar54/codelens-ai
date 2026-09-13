import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { SupportedLanguages } from '../components/landing/SupportedLanguages';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { LiveCodeReviewSection } from '../components/landing/LiveCodeReviewSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { PricingSection } from '../components/landing/PricingSection';
import { CodeLensCTASection } from '../components/landing/CodeLensCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { SectionDivider } from '../components/landing/SectionDivider';
import { CodeFlowBackground } from '../components/landing/CodeFlowBackground';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    document.title = 'CodeLens AI — AI-Powered Code Reviews & Security Audits';
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white selection:bg-[#5ed29c]/20 overflow-x-hidden transition-colors duration-300">
      {/* Floating Ambient Code Flow Animation */}
      <CodeFlowBackground />

      <LandingNavbar />
      <main className="relative z-10">
        <HeroSection />

        <SectionDivider label="UNIVERSAL STACK" />
        <SupportedLanguages />

        <SectionDivider label="CAPABILITIES" />
        <FeaturesSection />

        <SectionDivider label="INTERACTIVE DEMO" />
        <LiveCodeReviewSection />

        <SectionDivider label="WORKFLOW STEPS" />
        <HowItWorksSection />

        <SectionDivider label="PRICING PLANS" />
        <PricingSection />

        <CodeLensCTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
