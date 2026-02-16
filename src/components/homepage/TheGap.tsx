import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';

const barData = [
  { label: 'What You Need', percent: 100, color: 'bg-white/20' },
  { label: 'What You Have', percent: 38, color: 'bg-primary' },
];

export const TheGap: React.FC = () => (
  <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
    {/* Subtle grid overlay */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'linear-gradient(hsl(160 48% 21% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(160 48% 21% / 0.5) 1px, transparent 1px)',
      backgroundSize: '60px 60px'
    }} />

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left – dramatic stat */}
        <ScrollReveal>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">The Retirement Gap</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
            The average American has a{' '}
            <span className="text-primary">$1.2M</span>{' '}
            retirement shortfall.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-lg">
            Between hidden fees, market volatility, and outdated tax strategies, most people are unknowingly falling behind — and traditional advisors aren't closing the gap.
          </p>
        </ScrollReveal>

        {/* Right – bar visualization */}
        <ScrollReveal delay={0.2}>
          <div className="glass-card rounded-2xl p-8 md:p-10 space-y-8">
            {barData.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>{bar.label}</span>
                  <span>{bar.percent}%</span>
                </div>
                <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${bar.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <p className="text-white/80 text-sm">
                  <span className="font-semibold text-white">62%</span> gap between what's needed and what's saved
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);
