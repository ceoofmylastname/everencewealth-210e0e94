import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, Activity, Receipt, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { GlassCard } from './GlassCard';
import { useAnimatedCounter } from '@/hooks/useCountUp';

const icons = [TrendingDown, Activity, Receipt];

/* ───────── Inline SVG Charts ───────── */

const FeesBarComparison: React.FC<{ animate: boolean }> = ({ animate }) => {
  const maxW = 260;
  const withFee = 0.7 * maxW;   // $1.6M
  const withoutFee = maxW;       // $2.3M
  return (
    <svg viewBox="0 0 300 90" className="w-full h-24">
      {/* With 1% fee */}
      <text x="0" y="16" fill="hsl(0,60%,55%)" fontSize="11" fontWeight="600">With 1% Fee</text>
      <rect x="0" y="22" width={animate ? withFee : 0} height="18" rx="3" fill="hsl(0,60%,55%)" style={{ transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
      <text x={animate ? withFee + 6 : 6} y="36" fill="hsl(0,60%,55%)" fontSize="12" fontWeight="700" style={{ transition: 'x 1.2s cubic-bezier(0.16,1,0.3,1)', opacity: animate ? 1 : 0 }}>$1.6M</text>

      {/* With 0% fee */}
      <text x="0" y="60" fill="hsl(160,48%,30%)" fontSize="11" fontWeight="600">With 0% Fee</text>
      <rect x="0" y="66" width={animate ? withoutFee : 0} height="18" rx="3" fill="hsl(160,48%,30%)" style={{ transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s' }} />
      <text x={animate ? withoutFee + 6 : 6} y="80" fill="hsl(160,48%,30%)" fontSize="12" fontWeight="700" style={{ transition: 'x 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s', opacity: animate ? 1 : 0 }}>$2.3M</text>
    </svg>
  );
};

const VolatilityLineChart: React.FC<{ animate: boolean }> = ({ animate }) => {
  // Market: 100 -> 50 -> 75 (drop and partial recovery)
  // Protected: 100 -> 100 -> 112 (0% floor + growth)
  const w = 240, h = 100, pad = 20;
  const toY = (v: number) => pad + ((120 - v) / 120) * (h - 2 * pad);
  const toX = (i: number) => pad + i * ((w - 2 * pad) / 2);

  const marketPts = [100, 50, 75].map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const protectedPts = [100, 100, 112].map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const marketDots = [100, 50, 75].map((v, i) => ({ x: toX(i), y: toY(v) }));
  const protectedDots = [100, 100, 112].map((v, i) => ({ x: toX(i), y: toY(v) }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
      {/* Grid lines */}
      {[25, 50, 75, 100].map(v => (
        <line key={v} x1={pad} x2={w - pad} y1={toY(v)} y2={toY(v)} stroke="hsl(215,13%,85%)" strokeWidth="0.5" />
      ))}
      {/* Market line - red dashed */}
      <polyline
        points={marketPts}
        fill="none"
        stroke="hsl(0,60%,55%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        strokeDashoffset={animate ? '0' : '400'}
        style={{ transition: 'stroke-dashoffset 1.8s ease-out' }}
      />
      {/* Protected line - green solid */}
      <polyline
        points={protectedPts}
        fill="none"
        stroke="hsl(160,48%,30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="400"
        strokeDashoffset={animate ? '0' : '400'}
        style={{ transition: 'stroke-dashoffset 1.8s ease-out 0.3s' }}
      />
      {/* Dots */}
      {marketDots.map((d, i) => (
        <circle key={`m${i}`} cx={d.x} cy={d.y} r="3.5" fill="hsl(0,60%,55%)" opacity={animate ? 1 : 0} style={{ transition: `opacity 0.4s ease-out ${0.6 + i * 0.3}s` }} />
      ))}
      {protectedDots.map((d, i) => (
        <circle key={`p${i}`} cx={d.x} cy={d.y} r="3.5" fill="hsl(160,48%,30%)" opacity={animate ? 1 : 0} style={{ transition: `opacity 0.4s ease-out ${0.9 + i * 0.3}s` }} />
      ))}
      {/* Labels */}
      <text x={w - pad + 4} y={toY(75) + 4} fontSize="9" fill="hsl(0,60%,55%)" opacity={animate ? 0.8 : 0} style={{ transition: 'opacity 0.5s ease-out 1.5s' }}>Market</text>
      <text x={w - pad + 4} y={toY(112) + 4} fontSize="9" fill="hsl(160,48%,30%)" opacity={animate ? 0.8 : 0} style={{ transition: 'opacity 0.5s ease-out 1.5s' }}>Protected</text>
    </svg>
  );
};

const TaxComparisonChart: React.FC<{ animate: boolean }> = ({ animate }) => {
  const maxW = 260;
  const gross = 50000;
  const scale = maxW / gross;
  const federal = 11000 * scale;
  const state = 3500 * scale;
  const net401k = 35500 * scale;
  const fullIul = gross * scale;

  return (
    <svg viewBox="0 0 300 100" className="w-full h-28">
      {/* 401k label */}
      <text x="0" y="14" fontSize="11" fill="hsl(215,13%,50%)" fontWeight="600">401(k) — $50K withdrawal</text>
      {/* 401k stacked bar */}
      <rect x="0" y="20" width={animate ? federal : 0} height="18" fill="hsl(0,60%,55%)" rx="2" style={{ transition: 'width 1s cubic-bezier(0.16,1,0.3,1) 0.1s' }} />
      <rect x={animate ? federal : 0} y="20" width={animate ? state : 0} height="18" fill="hsl(30,80%,55%)" rx="0" style={{ transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s' }} />
      <rect x={animate ? federal + state : 0} y="20" width={animate ? net401k : 0} height="18" fill="hsl(215,13%,70%)" rx="2" style={{ transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.3s' }} />
      {/* 401k segment labels */}
      <text x="2" y="46" fontSize="8" fill="hsl(0,60%,55%)" opacity={animate ? 0.9 : 0} style={{ transition: 'opacity 0.5s 1s' }}>Fed $11K</text>
      <text x={federal + 2} y="46" fontSize="8" fill="hsl(30,80%,55%)" opacity={animate ? 0.9 : 0} style={{ transition: 'opacity 0.5s 1.1s' }}>State $3.5K</text>
      <text x={federal + state + 2} y="46" fontSize="8" fill="hsl(215,13%,50%)" opacity={animate ? 0.9 : 0} style={{ transition: 'opacity 0.5s 1.2s' }}>Net $35.5K</text>

      {/* IUL label */}
      <text x="0" y="66" fontSize="11" fill="hsl(160,48%,30%)" fontWeight="600">IUL — $50K withdrawal</text>
      {/* IUL full bar */}
      <rect x="0" y="72" width={animate ? fullIul : 0} height="18" fill="hsl(160,48%,30%)" rx="2" style={{ transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s' }} />
      <text x={animate ? fullIul + 6 : 6} y="85" fontSize="11" fill="hsl(160,48%,30%)" fontWeight="700" opacity={animate ? 1 : 0} style={{ transition: 'opacity 0.5s 1.3s' }}>$50K net</text>
    </svg>
  );
};

const charts = [FeesBarComparison, VolatilityLineChart, TaxComparisonChart];

/* ───────── Animation variants ───────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

/* ───────── Floating particle dots for compound CTA ───────── */
const particles = [
  { x: '10%', y: '20%', size: 6, delay: 0 },
  { x: '85%', y: '15%', size: 4, delay: 0.5 },
  { x: '70%', y: '80%', size: 5, delay: 1 },
  { x: '20%', y: '75%', size: 3, delay: 1.5 },
  { x: '50%', y: '10%', size: 4, delay: 0.8 },
];

/* ───────── Main Component ───────── */
export const PhilosophyKillers: React.FC = () => {
  const { t } = useTranslation();
  const k = t.philosophy.killers;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const counter = useAnimatedCounter(50, { duration: 3000, suffix: '%' });

  return (
    <section id="philosophy-killers" className="relative py-20 md:py-28 px-4 md:px-8 bg-gradient-to-br from-[hsl(90,5%,95%)] to-white overflow-hidden">
      {/* Decorative circular loader */}
      <div className="absolute top-16 right-16 opacity-[0.04] pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="hsl(160,48%,30%)" strokeWidth="2" strokeDasharray="20 10" className="animate-[spin_40s_linear_infinite]" />
          <circle cx="150" cy="150" r="110" fill="none" stroke="hsl(43,74%,49%)" strokeWidth="1.5" strokeDasharray="15 8" className="animate-[spin_30s_linear_infinite_reverse]" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto" ref={sectionRef}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(43,74%,49%)] to-transparent mb-6" />
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-muted-foreground/60 mb-4">
            {k.badge}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight max-w-3xl"
          >
            {k.headline}
          </motion.h2>
          <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
            {k.subheadline}
          </p>
        </motion.div>

        {/* Card Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {k.cards.map((card: { id: string; title: string; description: string; stat: string; statLabel: string; solution?: string }, idx: number) => {
            const Icon = icons[idx];
            const ChartComponent = charts[idx];
            return (
              <motion.div key={card.id} variants={cardVariants} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <GlassCard glow className="p-8 md:p-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-evergreen/10 to-evergreen/5 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-evergreen" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-space font-bold text-evergreen mb-3">{card.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{card.description}</p>

                  {/* SVG Chart */}
                  <div className="mb-4">
                    <ChartComponent animate={isInView} />
                  </div>

                  {/* Stat callout */}
                  <div className="border-t border-black/[0.06] pt-4 mb-4">
                    <span className="text-2xl font-space font-bold text-evergreen">{card.stat}</span>
                    <span className="text-xs text-muted-foreground/60 ml-2">{card.statLabel}</span>
                  </div>

                  {/* Solution callout */}
                  {card.solution && (
                    <div className="bg-evergreen/[0.06] px-4 py-3 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-evergreen mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium text-evergreen">{card.solution}</span>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Compound Effect CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <GlassCard dark className="p-12 md:p-16 text-center relative overflow-hidden">
            {/* Floating particles */}
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
                animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
              />
            ))}

            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-space font-bold text-white mb-6">
                {(k as any).compound?.title}
              </h3>
              <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
                {(k as any).compound?.description}
              </p>

              {/* Animated counter */}
              <div ref={counter.elementRef} className="flex justify-center items-baseline gap-2 mb-4">
                <span className="text-6xl md:text-8xl font-space font-bold text-white">{counter.formattedValue}</span>
              </div>
              <p className="text-sm text-white/50 mb-8">{(k as any).compound?.lossLabel}</p>

              {/* Gold divider */}
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[hsl(43,74%,49%)] to-transparent mx-auto mb-6" />

              <p className="text-2xl md:text-3xl font-space font-bold text-white">
                {(k as any).compound?.punchline}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
