import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Shield, Repeat, Wallet } from 'lucide-react';
import { ProcessStep } from '../shared/ProcessStep';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/i18n/useTranslation';

export const IULHowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.iul?.howItWorks;
  const [marketReturn, setMarketReturn] = useState([8]);
  const baseCash = 100000;
  const cap = 12;
  const floor = 0;
  const effectiveReturn = Math.max(floor, Math.min(cap, marketReturn[0]));
  const accountValue = Math.round(baseCash * (1 + effectiveReturn / 100));

  const steps = [
    { icon: DollarSign, title: s?.steps?.[0]?.title || 'You Pay Premium', description: s?.steps?.[0]?.desc || 'Your premium is split: part goes to insurance cost, part to cash value account.' },
    { icon: TrendingUp, title: s?.steps?.[1]?.title || 'Index Crediting Method', description: s?.steps?.[1]?.desc || 'Cash value is linked to S&P 500 with annual reset. When market goes up, you earn interest (subject to cap, typically 10-12%).' },
    { icon: Shield, title: s?.steps?.[2]?.title || '0% Floor Protection', description: s?.steps?.[2]?.desc || 'When market drops 20%, 30%, even 50%—you lose 0%. Your account value never decreases due to market losses.' },
    { icon: Repeat, title: s?.steps?.[3]?.title || 'Annual Reset & Compound Growth', description: s?.steps?.[3]?.desc || 'Gains lock in every year. Next year\'s growth calculated on new higher base. Compounding without volatility drag.' },
    { icon: Wallet, title: s?.steps?.[4]?.title || 'Tax-Free Access', description: s?.steps?.[4]?.desc || 'After policy is funded, take tax-free loans against cash value. No income tax, no penalties, no age restrictions.' },
  ];

  return (
    <section className="py-24 md:py-32 bg-muted/30 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-center mb-16"
        >
          {s?.title || 'How IUL Works: The Mechanics'}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Interactive diagram */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* SVG diagram */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <svg viewBox="0 0 400 220" className="w-full mb-6">
                {/* Background grid */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={`grid-${i}`} x1="50" y1={40 + i * 40} x2="380" y2={40 + i * 40} stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {/* Labels */}
                <text x="10" y="45" fontSize="10" fill="hsl(var(--muted-foreground))">+12%</text>
                <text x="18" y="125" fontSize="10" fill="hsl(var(--muted-foreground))">0%</text>
                <text x="10" y="205" fontSize="10" fill="hsl(var(--muted-foreground))">-50%</text>
                {/* Floor line */}
                <line x1="50" y1="120" x2="380" y2="120" stroke="hsl(43,74%,49%)" strokeWidth="2" strokeDasharray="6 3" />
                <text x="310" y="115" fontSize="9" fill="hsl(43,74%,49%)" fontWeight="600">0% FLOOR</text>
                {/* Cap line */}
                <line x1="50" y1="40" x2="380" y2="40" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 3" />
                <text x="330" y="35" fontSize="9" fill="hsl(var(--primary))" fontWeight="600">CAP</text>
                {/* Market bar */}
                {(() => {
                  const barHeight = Math.abs(marketReturn[0]) * (80 / 50);
                  const isNeg = marketReturn[0] < 0;
                  return (
                    <>
                      <rect
                        x="100"
                        y={isNeg ? 120 : 120 - barHeight}
                        width="60"
                        height={barHeight || 2}
                        rx="4"
                        fill={isNeg ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'}
                        opacity="0.6"
                      />
                      <text x="115" y="215" fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="500">Market</text>
                    </>
                  );
                })()}
                {/* IUL bar */}
                {(() => {
                  const iulHeight = effectiveReturn * (80 / 12);
                  return (
                    <>
                      <rect
                        x="240"
                        y={120 - iulHeight}
                        width="60"
                        height={iulHeight || 2}
                        rx="4"
                        fill="hsl(var(--primary))"
                      />
                      <text x="248" y="215" fontSize="10" fill="hsl(var(--primary))" fontWeight="500">Your IUL</text>
                    </>
                  );
                })()}
              </svg>

              {/* Slider */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  {s?.sliderLabel || 'Adjust Market Performance:'}
                </p>
                <Slider
                  value={marketReturn}
                  onValueChange={setMarketReturn}
                  min={-50}
                  max={50}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>-50%</span>
                  <span className="font-semibold text-foreground">{marketReturn[0]}%</span>
                  <span>+50%</span>
                </div>
              </div>

              {/* Result */}
              <div className="rounded-xl p-4 bg-primary text-primary-foreground">
                <p className="text-sm font-semibold">{s?.resultLabel || 'Your IUL Account Value:'}</p>
                <p className="text-3xl font-bold mt-1">${accountValue.toLocaleString()}</p>
                <p className="text-xs mt-1 opacity-80">
                  {marketReturn[0] < 0
                    ? (s?.floorMessage || 'Floor Protection: You never go below $100,000')
                    : `Credited: ${effectiveReturn}%${marketReturn[0] > cap ? ` (capped at ${cap}%)` : ''}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Steps */}
          <div className="space-y-7">
            {steps.map((step, i) => (
              <ProcessStep
                key={i}
                number={i + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
