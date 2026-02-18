import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Gift, Landmark, Heart } from 'lucide-react';
import { ProcessStep } from '../shared/ProcessStep';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/i18n/useTranslation';

export const WLHowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).strategies?.wholeLife?.howItWorks;
  const [year, setYear] = useState([15]);

  const annualPremium = 25000;
  const guaranteedRate = 0.04;
  const dividendRate = 0.025;

  const data = useMemo(() => {
    const points: { year: number; guaranteed: number; projected: number }[] = [];
    let gCV = 0;
    let pCV = 0;
    for (let y = 1; y <= 30; y++) {
      gCV = (gCV + annualPremium) * (1 + guaranteedRate);
      pCV = (pCV + annualPremium) * (1 + guaranteedRate + dividendRate);
      points.push({ year: y, guaranteed: Math.round(gCV), projected: Math.round(pCV) });
    }
    return points;
  }, []);

  const currentData = data[year[0] - 1];
  const maxVal = data[29].projected;

  // SVG chart dimensions
  const chartW = 360, chartH = 180, padL = 50, padR = 10, padT = 15, padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toX = (y: number) => padL + ((y - 1) / 29) * plotW;
  const toY = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const guaranteedPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.year)},${toY(d.guaranteed)}`).join(' ');
  const projectedPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.year)},${toY(d.projected)}`).join(' ');

  const steps = [
    { icon: DollarSign, title: s?.steps?.[0]?.title || 'Pay Premium', description: s?.steps?.[0]?.desc || 'A fixed annual premium funds both your death benefit and guaranteed cash value accumulation from day one.' },
    { icon: TrendingUp, title: s?.steps?.[1]?.title || 'Guaranteed Cash Value', description: s?.steps?.[1]?.desc || 'Your cash value grows at a guaranteed rate every year—regardless of markets, economy, or interest rates.' },
    { icon: Gift, title: s?.steps?.[2]?.title || 'Dividend Crediting', description: s?.steps?.[2]?.desc || 'Mutual insurance carriers pay annual dividends on top of guaranteed growth. While not guaranteed, top carriers have paid dividends for 100+ consecutive years.' },
    { icon: Landmark, title: s?.steps?.[3]?.title || 'Policy Loans (Infinite Banking)', description: s?.steps?.[3]?.desc || 'Borrow against your cash value at any time, for any reason—no credit check, no tax event. Your policy continues to earn dividends on the full balance.' },
    { icon: Heart, title: s?.steps?.[4]?.title || 'Death Benefit', description: s?.steps?.[4]?.desc || 'A guaranteed, income-tax-free death benefit that never expires and never decreases—providing generational wealth transfer.' },
  ];

  return (
    <section className="py-24 md:py-32 bg-muted/30 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#09301B] text-center mb-16"
        >
          {s?.title || 'How Whole Life Works'}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Interactive SVG chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-4">{s?.chartTitle || 'Cash Value Growth Over Time'}</p>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full mb-6">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1={padL} y1={padT + i * (plotH / 4)} x2={chartW - padR} y2={padT + i * (plotH / 4)} stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {/* Y axis labels */}
                <text x="5" y={padT + 4} fontSize="8" fill="hsl(var(--muted-foreground))">
                  ${(maxVal / 1000000).toFixed(1)}M
                </text>
                <text x="5" y={padT + plotH / 2 + 4} fontSize="8" fill="hsl(var(--muted-foreground))">
                  ${(maxVal / 2000000).toFixed(1)}M
                </text>
                <text x="5" y={padT + plotH + 4} fontSize="8" fill="hsl(var(--muted-foreground))">$0</text>
                {/* X axis labels */}
                {[1, 10, 20, 30].map(y => (
                  <text key={y} x={toX(y)} y={chartH - 5} fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle">Yr {y}</text>
                ))}
                {/* Guaranteed line */}
                <path d={guaranteedPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
                {/* Projected line */}
                <path d={projectedPath} fill="none" stroke="hsl(43,74%,49%)" strokeWidth="2.5" strokeDasharray="6 3" />
                {/* Current year marker */}
                <line x1={toX(year[0])} y1={padT} x2={toX(year[0])} y2={padT + plotH} stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                <circle cx={toX(year[0])} cy={toY(currentData.guaranteed)} r="4" fill="hsl(var(--primary))" />
                <circle cx={toX(year[0])} cy={toY(currentData.projected)} r="4" fill="hsl(43,74%,49%)" />
              </svg>

              {/* Legend */}
              <div className="flex gap-6 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary" />
                  <span className="text-muted-foreground">{s?.legendGuaranteed || 'Guaranteed'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ background: 'hsl(43,74%,49%)', borderTop: '1px dashed hsl(43,74%,49%)' }} />
                  <span className="text-muted-foreground">{s?.legendDividend || 'With Dividends'}</span>
                </div>
              </div>

              {/* Slider */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  {s?.sliderLabel || 'Policy Year:'}
                </p>
                <Slider value={year} onValueChange={setYear} min={1} max={30} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Year 1</span>
                  <span className="font-semibold text-foreground">Year {year[0]}</span>
                  <span>Year 30</span>
                </div>
              </div>

              {/* Result */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 bg-primary text-primary-foreground">
                  <p className="text-xs font-semibold">{s?.guaranteedLabel || 'Guaranteed Cash Value'}</p>
                  <p className="text-2xl font-bold mt-1">${currentData.guaranteed.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'hsl(43,74%,49%)', color: 'hsl(160,48%,12%)' }}>
                  <p className="text-xs font-semibold">{s?.projectedLabel || 'With Dividends'}</p>
                  <p className="text-2xl font-bold mt-1">${currentData.projected.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {s?.premiumNote || `Based on $${annualPremium.toLocaleString()}/year premium · Dividends are not guaranteed`}
              </p>
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
