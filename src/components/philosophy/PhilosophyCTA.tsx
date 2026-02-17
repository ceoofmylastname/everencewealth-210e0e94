import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check, DollarSign, Building2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { GlassCard } from './GlassCard';
import { useAnimatedCounter } from '@/hooks/useCountUp';

const BenefitItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex items-center gap-3"
  >
    <div className="w-6 h-6 rounded-full bg-evergreen/10 flex items-center justify-center flex-shrink-0">
      <Check className="w-3.5 h-3.5 text-evergreen" />
    </div>
    <span className="text-foreground/80 text-base">{text}</span>
  </motion.div>
);

const statIcons = [DollarSign, Building2, Shield];

const StatCard: React.FC<{ value: string; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
  <div className="text-center">
    <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-evergreen/10 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-2xl font-bold text-evergreen font-space">{value}</p>
    <p className="text-xs text-foreground/60 mt-1 leading-tight">{label}</p>
  </div>
);

export const PhilosophyCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const c = t.philosophy.cta;
  const sectionRef = useRef<HTMLDivElement>(null);

  const familiesCounter = useAnimatedCounter('1200', { duration: 2500 });

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 md:px-8 bg-background overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'url(/patterns/dots.svg)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Left: CTA Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3"
          >
            <h2 className="text-4xl md:text-6xl font-space font-bold text-evergreen leading-tight mb-6">
              {c.headline}
            </h2>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed mb-8 max-w-2xl">
              {c.subtitle}
            </p>

            {/* Benefits list */}
            <div className="space-y-3 mb-10">
              {c.benefits.map((benefit: string, i: number) => (
                <BenefitItem key={i} text={benefit} delay={i * 0.08} />
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/contact')}
                className="group relative px-8 py-4 rounded-xl bg-[hsl(43,74%,49%)] text-evergreen font-space font-bold text-sm tracking-wide overflow-hidden hover:shadow-[0_0_30px_hsla(43,74%,49%,0.35)] transition-shadow duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {c.primaryCta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              <button
                onClick={() => navigate('/resources')}
                className="px-8 py-4 rounded-xl border-2 border-evergreen text-evergreen font-space font-bold text-sm tracking-wide hover:bg-evergreen hover:text-white transition-all duration-300"
              >
                {c.secondaryCta}
              </button>
            </div>
          </motion.div>

          {/* Right: Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-10 md:p-12 text-center space-y-10">
              {/* Main stat */}
              <div ref={familiesCounter.elementRef}>
                <p className="text-6xl md:text-7xl font-bold text-evergreen font-space">
                  {c.stats.familiesCount}
                </p>
                <p className="text-base text-foreground/60 mt-4 leading-relaxed max-w-xs mx-auto">
                  {c.stats.familiesLabel}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[hsl(43,74%,49%)] to-transparent" />

              {/* Mini stats grid */}
              <div className="grid grid-cols-3 gap-4">
                {c.stats.miniStats.map((stat: { value: string; label: string }, i: number) => {
                  const Icon = statIcons[i];
                  return (
                    <StatCard
                      key={i}
                      value={stat.value}
                      label={stat.label}
                      icon={<Icon className="w-5 h-5 text-evergreen" />}
                    />
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
