import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, Building, HeartPulse } from 'lucide-react';
import { GlassCard } from '@/components/philosophy/GlassCard';
import { useTranslation } from '@/i18n/useTranslation';

const layers = [
  { icon: Wallet, color: 'hsl(210,70%,50%)', title: 'Roth IRA', amount: '$7,000/year', desc: 'After-tax contributions grow tax-free. Withdraw tax-free after 59½. No RMDs ever. The foundation of every tax-free retirement plan.' },
  { icon: Shield, color: 'hsl(43,74%,49%)', title: 'Indexed Universal Life (IUL)', amount: '$50K–$100K/year', desc: 'Tax-free policy loans in retirement. 0% floor protection. No contribution limits. The primary engine for high-income tax-free retirement.' },
  { icon: Building, color: 'hsl(160,48%,30%)', title: 'Municipal Bonds', amount: 'As Needed', desc: 'Interest income exempt from federal taxes (and often state taxes). Provides stable, predictable cash flow to supplement other vehicles.' },
  { icon: HeartPulse, color: 'hsl(340,65%,50%)', title: 'HSA (Health Savings Account)', amount: 'Triple Tax-Free', desc: 'Tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses. After 65, withdrawals for any purpose (taxed as income) or medical (tax-free).' },
];

export const TFRIncomeStacking: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.incomeStacking;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-6"
        >
          {s?.title || 'Tax-Free Income Stacking'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground text-center mb-16 max-w-3xl mx-auto"
        >
          {s?.subtitle || 'Layer multiple tax-free vehicles to build a retirement income that owes nothing to the IRS.'}
        </motion.p>

        <div className="space-y-6">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="rounded-2xl border-l-4" style={{ borderLeftColor: layer.color }}>
              <GlassCard className="p-6 md:p-8" glow>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 md:w-1/3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${layer.color}20` }}>
                      <layer.icon className="w-6 h-6" style={{ color: layer.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{s?.layers?.[i]?.title || layer.title}</h3>
                      <span className="text-sm font-semibold" style={{ color: layer.color }}>{s?.layers?.[i]?.amount || layer.amount}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground md:w-2/3 leading-relaxed">
                    {s?.layers?.[i]?.desc || layer.desc}
                  </p>
                </div>
              </GlassCard>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center rounded-2xl p-6 border border-primary/20 bg-primary/5"
        >
          <p className="text-sm text-muted-foreground mb-1">{s?.totalLabel || 'Combined Tax-Free Retirement Income Potential'}</p>
          <p className="text-3xl md:text-4xl font-bold text-[#09301B]">{s?.totalValue || '$100,000 – $200,000+/year'}</p>
          <p className="text-sm text-muted-foreground mt-1">{s?.totalNote || 'With $0 in federal or state income taxes'}</p>
        </motion.div>
      </div>
    </section>
  );
};
