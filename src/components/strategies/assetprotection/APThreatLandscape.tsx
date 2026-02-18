import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProcessStep } from '../shared/ProcessStep';
import { Gavel, CreditCard, Heart, Landmark, BedDouble } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const threats = [
  { icon: Gavel, label: 'Lawsuits', cost: 'Avg. lawsuit: $54K', color: 'hsl(0,65%,50%)' },
  { icon: CreditCard, label: 'Creditors', cost: 'Business debts pierce personal assets', color: 'hsl(30,80%,50%)' },
  { icon: Heart, label: 'Divorce', cost: '50% of assets at risk', color: 'hsl(340,65%,50%)' },
  { icon: Landmark, label: 'Estate Taxes', cost: '40% over $13.6M exemption', color: 'hsl(260,50%,50%)' },
  { icon: BedDouble, label: 'Nursing Home', cost: '$108K/year avg. cost', color: 'hsl(200,60%,50%)' },
];

export const APThreatLandscape: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.assetProtection?.threats;
  const [active, setActive] = useState<number | null>(null);

  const steps = [
    { icon: Gavel, title: s?.steps?.[0]?.title || 'Frivolous Lawsuits', desc: s?.steps?.[0]?.desc || 'Over 40 million lawsuits are filed annually in the U.S. Even if you win, legal defense costs average $54,000—and assets held in your personal name are fully exposed.' },
    { icon: CreditCard, title: s?.steps?.[1]?.title || 'Business Creditors', desc: s?.steps?.[1]?.desc || 'Without proper structure, business debts and liabilities can pierce through to your personal assets—home, savings, and retirement accounts.' },
    { icon: Heart, title: s?.steps?.[2]?.title || 'Divorce Asset Splitting', desc: s?.steps?.[2]?.desc || 'In community property states, up to 50% of unprotected assets can be claimed. Properly structured assets may be shielded from equitable distribution.' },
    { icon: Landmark, title: s?.steps?.[3]?.title || 'Estate Tax Erosion', desc: s?.steps?.[3]?.desc || 'Estates exceeding $13.61M (2024) face a 40% federal estate tax. Without planning, nearly half your legacy could go to the IRS instead of your heirs.' },
    { icon: BedDouble, title: s?.steps?.[4]?.title || 'Long-Term Care Drain', desc: s?.steps?.[4]?.desc || 'The average nursing home costs $108,000/year. Without protection, a 3-5 year stay can completely wipe out a lifetime of savings.' },
  ];

  const rings = [180, 150, 120, 90, 60];

  return (
    <section id="ap-threats" className="py-24 md:py-32 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-16"
        >
          {s?.title || 'The Threat Landscape'}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Interactive SVG */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/60 backdrop-blur-md border border-border p-6 md:p-8 flex flex-col items-center"
          >
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto">
              {/* Concentric rings */}
              {rings.map((r, i) => (
                <g key={i}>
                  <circle
                    cx={200} cy={200} r={r}
                    fill="none"
                    stroke={active === i ? threats[i].color : 'hsl(0,0%,85%)'}
                    strokeWidth={active === i ? 4 : 2}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(active === i ? null : i)}
                    opacity={active === null || active === i ? 1 : 0.3}
                  />
                  {/* Label on ring */}
                  <text
                    x={200} y={200 - r + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={active === i ? '700' : '500'}
                    fill={active === i ? threats[i].color : 'hsl(0,0%,50%)'}
                    className="cursor-pointer select-none"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(active === i ? null : i)}
                  >
                    {s?.rings?.[i] || threats[i].label}
                  </text>
                </g>
              ))}

              {/* Central node */}
              <motion.circle
                cx={200} cy={200} r={30}
                fill="hsl(43,74%,49%)"
                animate={active !== null ? { filter: 'drop-shadow(0 0 12px hsl(43,74%,49%))' } : { filter: 'drop-shadow(0 0 4px hsl(43,74%,49%,0.3))' }}
              />
              <text x={200} y={196} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(160,48%,12%)">
                {s?.centerTop || 'YOUR'}
              </text>
              <text x={200} y={208} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(160,48%,12%)">
                {s?.centerBottom || 'WEALTH'}
              </text>
            </svg>

            {/* Active threat info */}
            <AnimatePresence mode="wait">
              {active !== null && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-center rounded-xl px-5 py-3 border"
                  style={{ borderColor: `${threats[active].color}40`, background: `${threats[active].color}10` }}
                >
                  <p className="text-sm font-bold" style={{ color: threats[active].color }}>
                    {s?.rings?.[active] || threats[active].label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s?.costs?.[active] || threats[active].cost}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Steps side */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <ProcessStep
                key={i}
                number={i + 1}
                title={step.title}
                description={step.desc}
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
