import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, DollarSign, Shield, CheckCircle, Scale, Heart } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MorphingBlob } from './MorphingBlob';
import { useTranslation } from '@/i18n/useTranslation';

/* ── Inline SVG Charts ─────────────────────────────────────── */

const PrincipleBarChart: React.FC<{ bars: { label: string; value: number }[]; inView: boolean }> = ({ bars, inView }) => (
  <svg viewBox="0 0 260 80" className="w-full" aria-hidden="true">
    {bars.map((bar, i) => (
      <g key={i}>
        <rect
          x="0"
          y={i * 36 + 2}
          width={inView ? (bar.value / 100) * 200 : 0}
          height="22"
          rx="2"
          fill={i === 0 ? 'hsl(160,48%,21%)' : 'hsl(43,74%,49%)'}
          style={{ transition: `width 1.2s cubic-bezier(.4,0,.2,1) ${i * 0.2}s` }}
        />
        <text x="0" y={i * 36 + 34} fontSize="10" fill="hsl(210,10%,40%)" fontFamily="inherit">
          {bar.label}
        </text>
      </g>
    ))}
  </svg>
);

const PrincipleLineChart: React.FC<{ inView: boolean }> = ({ inView }) => {
  const marketPoints = '20,60 130,120 240,96';
  const iulPoints = '20,60 130,60 240,40';
  const totalLen = 400;
  return (
    <svg viewBox="0 0 260 140" className="w-full" aria-hidden="true">
      {/* grid lines */}
      {[40, 60, 80, 100, 120].map(y => (
        <line key={y} x1="20" y1={y} x2="240" y2={y} stroke="hsl(210,10%,88%)" strokeWidth="0.5" />
      ))}
      {/* Market line (red, dashed) */}
      <polyline
        points={marketPoints}
        fill="none"
        stroke="hsl(0,84%,60%)"
        strokeWidth="2.5"
        strokeDasharray={totalLen}
        strokeDashoffset={inView ? 0 : totalLen}
        strokeLinecap="round"
        strokeDashoffset-transition="all"
        style={{ transition: `stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) 0.2s` }}
      />
      {/* IUL line (evergreen, solid) */}
      <polyline
        points={iulPoints}
        fill="none"
        stroke="hsl(160,48%,21%)"
        strokeWidth="2.5"
        strokeDasharray={totalLen}
        strokeDashoffset={inView ? 0 : totalLen}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) 0.4s` }}
      />
      {/* Legend */}
      <circle cx="30" cy="132" r="4" fill="hsl(0,84%,60%)" />
      <text x="38" y="136" fontSize="9" fill="hsl(210,10%,40%)">Market</text>
      <circle cx="100" cy="132" r="4" fill="hsl(160,48%,21%)" />
      <text x="108" y="136" fontSize="9" fill="hsl(210,10%,40%)">IUL (0% Floor)</text>
    </svg>
  );
};

const PrincipleDonutChart: React.FC<{ centerText: string; centerLabel: string; inView: boolean }> = ({ centerText, centerLabel, inView }) => {
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto" aria-hidden="true">
      {/* bg ring */}
      <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(210,10%,92%)" strokeWidth="10" />
      {/* fill ring */}
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="hsl(160,48%,21%)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={inView ? 0 : circ}
        transform="rotate(-90 60 60)"
        style={{ transition: `stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) 0.3s` }}
      />
      <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="hsl(160,48%,21%)">{centerText}</text>
      <text x="60" y="72" textAnchor="middle" fontSize="9" fill="hsl(210,10%,40%)">{centerLabel}</text>
    </svg>
  );
};

/* ── Icon Swap (CSS-only morph) ────────────────────────────── */

const IconSwap: React.FC<{ primary: React.ReactNode; secondary: React.ReactNode }> = ({ primary, secondary }) => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-75">
      {primary}
    </div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
      {secondary}
    </div>
  </div>
);

/* ── Gradient Overlays ─────────────────────────────────────── */

const gradients = [
  'linear-gradient(135deg, hsla(160,48%,21%,0.15) 0%, hsla(43,74%,49%,0.10) 100%)',
  'linear-gradient(135deg, hsla(160,48%,21%,0.15) 0%, hsla(217,91%,60%,0.10) 100%)',
  'linear-gradient(135deg, hsla(160,48%,21%,0.15) 0%, hsla(270,60%,55%,0.10) 100%)',
];

const iconPairs = [
  { A: <TrendingUp className="w-16 h-16" style={{ color: 'hsl(160,48%,21%)' }} />, B: <DollarSign className="w-16 h-16" style={{ color: 'hsl(43,74%,49%)' }} /> },
  { A: <Shield className="w-16 h-16" style={{ color: 'hsl(160,48%,21%)' }} />, B: <CheckCircle className="w-16 h-16" style={{ color: 'hsl(142,71%,35%)' }} /> },
  { A: <Scale className="w-16 h-16" style={{ color: 'hsl(160,48%,21%)' }} />, B: <Heart className="w-16 h-16" style={{ color: 'hsl(0,84%,60%)' }} /> },
];

/* ── Main Component ────────────────────────────────────────── */

export const PhilosophyPrinciples: React.FC = () => {
  const { t } = useTranslation();
  const p = (t.philosophy as any).principles;
  const sectionRef = useRef<HTMLElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const chartsInView = useInView(chartsRef, { once: true, margin: '-80px' });

  if (!p) return null;

  const cards = p.cards as any[];

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden" style={{ background: 'hsl(40,33%,96%)' }}>
      {/* Morphing blobs */}
      <MorphingBlob
        className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-[0.07]"
        colors={['hsl(160,48%,21%)', 'hsl(43,74%,49%)']}
      />
      <MorphingBlob
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] opacity-[0.07]"
        colors={['hsl(43,74%,49%)', 'hsl(160,48%,21%)']}
        morphSpeed={10000}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-4 py-1.5 rounded-full"
            style={{ color: 'hsl(160,48%,21%)', background: 'hsla(160,48%,21%,0.08)', border: '1px solid hsla(160,48%,21%,0.15)' }}
          >
            {p.badge}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: 'hsl(160,48%,21%)' }}>
            {p.headline}
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'hsl(210,10%,40%)' }}>
            {p.subheadline}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {cards.map((card: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group"
            >
              <GlassCard className="p-8 md:p-10 h-full relative overflow-hidden" glow>
                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: gradients[idx] }}
                />

                <div className="relative z-10">
                  {/* Icon swap */}
                  <div className="mb-6">
                    <IconSwap primary={iconPairs[idx].A} secondary={iconPairs[idx].B} />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'hsl(160,48%,21%)' }}>
                    {card.title}
                  </h3>
                  <p className="text-base leading-relaxed mb-6" style={{ color: 'hsl(210,10%,40%)' }}>
                    {card.description}
                  </p>

                  {/* Chart area */}
                  <div className="p-5 rounded-xl" style={{ background: 'hsla(160,48%,21%,0.04)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: 'hsl(160,48%,21%)' }}>
                      {card.chartLabel}
                    </p>

                    {idx === 0 && card.bars && (
                      <PrincipleBarChart bars={card.bars} inView={chartsInView} />
                    )}
                    {idx === 1 && (
                      <PrincipleLineChart inView={chartsInView} />
                    )}
                    {idx === 2 && (
                      <PrincipleDonutChart
                        centerText={card.centerText || '100%'}
                        centerLabel={card.centerLabel || 'Client First'}
                        inView={chartsInView}
                      />
                    )}

                    <p className="text-sm mt-3" style={{ color: 'hsl(210,10%,40%)' }}>
                      {card.chartNote}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
