import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { Button } from '../ui/Button';

export const PricingSection: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  const plans = [
    {
      id: 'free',
      name: 'Free Developer',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Ideal for individual developers exploring automated AI code reviews.',
      features: [
        '20 Instant AI Code Reviews / month',
        'Standard OWASP Security Audit',
        'TypeScript, Python & JS Support',
        'Client-Side AST Analysis',
        'Community Discord Support',
      ],
      popular: false,
      buttonText: 'Start Free Trial',
      buttonVariant: 'ghost' as const,
      orderMobile: 'order-2 lg:order-1',
    },
    {
      id: 'pro',
      name: 'Pro Engineer',
      priceMonthly: 29,
      priceAnnual: 24,
      description: 'For professional engineers & senior devs shipping code daily.',
      features: [
        'Unlimited AI Code Reviews',
        'Deep AST Logic & Performance Audit',
        'All 10+ Supported Languages',
        'Custom Refactoring Recommendations',
        'GitHub PR Review Webhooks',
        'Priority AI Engine Processing',
      ],
      popular: true,
      buttonText: 'Get Started Pro',
      buttonVariant: 'primary' as const,
      orderMobile: 'order-1 lg:order-2',
    },
    {
      id: 'enterprise',
      name: 'Team / Enterprise',
      priceMonthly: 99,
      priceAnnual: 79,
      description: 'Custom security policies, SAML SSO, and dedicated AI models for teams.',
      features: [
        'Unlimited Team Seats & Repositories',
        'Custom Enterprise Rule Policies',
        'SOC2 & HIPAA Security Compliance',
        'Dedicated On-Prem or Cloud VPC',
        'SAML SSO & Audit Logging',
        '24/7 Dedicated Support Engineer',
      ],
      popular: false,
      buttonText: 'Contact Enterprise',
      buttonVariant: 'ghost' as const,
      orderMobile: 'order-3 lg:order-3',
    },
  ];

  return (
    <section id="pricing" className="relative py-16 sm:py-24 bg-transparent dark:bg-[#070b0a] text-slate-700 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3"
        >
          <span className="font-jakarta text-[11px] font-bold uppercase tracking-widest text-[#159C63] dark:text-[#5ed29c]">
            SIMPLE, TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            CHOOSE THE PLAN THAT FITS YOUR WORKFLOW<span className="text-[#159C63] dark:text-[#5ed29c]">.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-white/70 font-normal">
            Start reviewing code for free. Upgrade anytime for unlimited team reviews.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${!annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/60'}`}>
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="relative w-12 h-6 rounded-full bg-slate-200 dark:bg-white/10 p-1 border border-slate-300 dark:border-white/15 transition-colors focus:outline-none flex items-center"
            >
              <motion.div
                animate={{ x: annualBilling ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-[#5ed29c]"
              />
            </button>

            <span className={`text-xs font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/60'}`}>
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#159C63]/15 dark:bg-[#5ed29c]/15 text-[#159C63] dark:text-[#5ed29c]">
                SAVE 20%
              </span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = annualBilling ? plan.priceAnnual : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col ${plan.orderMobile}`}
              >
                <LiquidGlassCard
                  glowColor={plan.popular ? 'accent' : undefined}
                  className={`h-full p-8 flex flex-col justify-between relative transition-all ${
                    plan.popular
                      ? 'border-[#5ed29c] dark:border-[#5ed29c]/80 shadow-2xl shadow-emerald-500/10'
                      : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#159C63] to-[#5ed29c] text-[#070b0a] font-mono text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>MOST POPULAR</span>
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-white/50">/ month</span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Features</span>
                      <ul className="space-y-2.5 text-xs text-slate-600 dark:text-white/80">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#159C63] dark:text-[#5ed29c] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link to="/register" className="block w-full">
                      <Button
                        variant={plan.buttonVariant}
                        className={`w-full py-3 text-xs uppercase font-bold tracking-wider ${
                          plan.popular
                            ? 'bg-[#5ed29c] hover:bg-[#4ec28c] text-[#070b0a] shadow-lg shadow-[#5ed29c]/25'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15'
                        }`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
