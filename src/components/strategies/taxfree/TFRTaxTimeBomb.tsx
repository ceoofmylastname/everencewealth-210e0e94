import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ProcessStep } from '../shared/ProcessStep';
import { AlertTriangle, TrendingUp, Receipt, HeartPulse, Landmark } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const FEDERAL_RATE = 0.24;
const STATE_RATE = 0.093;
const TOTAL_RATE = FEDERAL_RATE + STATE_RATE;
const YEARS = 30;

export const TFRTaxTimeBomb: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.taxFreeRetirement?.taxTimeBomb;
  const [withdrawal, setWithdrawal] = useState(100000);

  const data = useMemo(() => {
    const points = [];
    let cumTax = 0;
    for (let y = 1; y <= YEARS; y++) {
      cumTax += withdrawal * TOTAL_RATE;
      points.push({ year: y, cumTax: Math.round(cumTax) });
    }
    return points;
  }, [withdrawal]);

  const totalTaxPaid = data[data.length - 1].cumTax;
  const maxTax = totalTaxPaid;
  const svgW = 500;
  const svgH = 280;
  const pad = { t: 20, r: 20, b: 40, l: 60 };
  const chartW = svgW - pad.l - pad.r;
  const chartH = svgH - pad.t - pad.b;

  const barW = chartW / YEARS - 2;

  const steps = [
    { icon: AlertTriangle, title: s?.steps?.[0]?.title || 'Required Minimum Distributions', desc: s?.steps?.[0]?.desc || 'At age 73, the IRS forces you to withdraw from your 401k/IRA—whether you need the money or not—creating a taxable event every single year.' },
    { icon: TrendingUp, title: s?.steps?.[1]?.title || 'Tax Bracket Creep', desc: s?.steps?.[1]?.desc || 'RMDs + Social Security + pensions can push you into higher tax brackets in retirement than you were in while working.' },
    { icon: Receipt, title: s?.steps?.[2]?.title || 'Social Security Taxation', desc: s?.steps?.[2]?.desc || 'Up to 85% of your Social Security benefits become taxable when your combined income exceeds $44,000 (married filing jointly).' },
    { icon: HeartPulse, title: s?.steps?.[3]?.title || 'Medicare Surcharges (IRMAA)', desc: s?.steps?.[3]?.desc || 'High retirement income triggers Income-Related Monthly Adjustment Amounts—adding $170-$578/month per person to Medicare Part B and D premiums.' },
    { icon: Landmark, title: s?.steps?.[4]?.title || 'Estate Tax Exposure', desc: s?.steps?.[4]?.desc || 'Tax-deferred accounts pass to heirs as taxable income under the SECURE Act\'s 10-year rule, potentially devastating inherited wealth.' },
  ];

  return (
    <section id="tfr-tax-bomb" className="py-24 md:py-32 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-16"
        >
          {s?.title || 'The Tax Time Bomb'}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Chart side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/60 backdrop-blur-md border border-border p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-2">
              {s?.chartTitle || 'Cumulative Taxes Paid on 401k Withdrawals'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {s?.chartSubtitle || `$${(withdrawal / 1000).toFixed(0)}K/year withdrawal · ${(TOTAL_RATE * 100).toFixed(1)}% combined tax rate · 30 years`}
            </p>

            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                {s?.sliderLabel || 'Annual Withdrawal:'} <span className="text-[#09301B] font-bold">${(withdrawal / 1000).toFixed(0)}K</span>
              </label>
              <Slider
                value={[withdrawal]}
                onValueChange={v => setWithdrawal(v[0])}
                min={50000}
                max={200000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$50K</span>
                <span>$200K</span>
              </div>
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
              {/* Y axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                const val = maxTax * pct;
                const y = pad.t + chartH - chartH * pct;
                return (
                  <g key={pct}>
                    <line x1={pad.l} y1={y} x2={pad.l + chartW} y2={y} stroke="hsl(0,0%,85%)" strokeDasharray="4" />
                    <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(0,0%,50%)">
                      ${(val / 1000).toFixed(0)}K
                    </text>
                  </g>
                );
              })}
              {/* Bars */}
              {data.map((d, i) => {
                const barH = (d.cumTax / maxTax) * chartH;
                const x = pad.l + i * (chartW / YEARS) + 1;
                const y = pad.t + chartH - barH;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={2}
                    fill="hsl(0,65%,50%)"
                    opacity={0.75}
                  />
                );
              })}
              {/* X axis labels */}
              {[1, 10, 20, 30].map(yr => {
                const x = pad.l + (yr - 1) * (chartW / YEARS) + barW / 2;
                return (
                  <text key={yr} x={x} y={svgH - 8} textAnchor="middle" fontSize="10" fill="hsl(0,0%,50%)">
                    Yr {yr}
                  </text>
                );
              })}
            </svg>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/20 px-5 py-4">
              <div>
                <p className="text-sm text-muted-foreground">{s?.totalLabel || '30-Year Tax Bill (401k):'}</p>
                <p className="text-2xl font-bold text-destructive">${(totalTaxPaid / 1000).toFixed(0)}K</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{s?.taxFreeLabel || 'Tax-Free Strategy:'}</p>
                <p className="text-2xl font-bold text-[#09301B]">$0</p>
              </div>
            </div>
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
