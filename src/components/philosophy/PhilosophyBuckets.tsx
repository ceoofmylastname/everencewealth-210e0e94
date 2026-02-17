import React, { useState, useCallback, Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { MorphingBlob } from './MorphingBlob';

// Error boundary for 3D canvas
class CanvasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('3D Canvas failed to load:', error); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// Lazy-load 3D canvas with error handling
const BucketCanvas = lazy(() =>
  import('./BucketCanvas').catch(() => ({
    default: () => null as any,
  }))
);

/* ── Inline sub-components ── */

const BUCKET_COLORS = ['#EF4444', '#F59E0B', '#10B981'];
const BORDER_COLORS = [
  'border-[#EF4444]',
  'border-[#F59E0B]',
  'border-[#10B981]',
];
const BG_COLORS = [
  'bg-[#EF4444]',
  'bg-[#F59E0B]',
  'bg-[#10B981]',
];

/** Styled range slider */
const TaxBucketSlider: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}> = ({ label, value, onChange, color }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex justify-between text-xs font-space mb-1">
      <span className="text-white/70">{label}</span>
      <span className="font-bold" style={{ color }}>{value}%</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${color} ${value}%, rgba(255,255,255,0.15) ${value}%)`,
      }}
    />
  </div>
);

/** Animated SVG donut badge showing tax rate */
const TaxRateBadge: React.FC<{
  rate: number;
  label: string;
  color: string;
}> = ({ rate, label, color }) => {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <svg ref={ref} width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
        <circle
          cx="24" cy="24" r={radius}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"
        />
        <circle
          cx="24" cy="24" r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference}
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text
          x="24" y="24"
          textAnchor="middle" dominantBaseline="central"
          className="text-[10px] font-bold fill-white font-space"
        >
          {rate}%
        </text>
      </svg>
      <span className="text-xs text-white/60 font-space">{label}</span>
    </div>
  );
};

/* ── Main component ── */

export const PhilosophyBuckets: React.FC = () => {
  const { t } = useTranslation();
  const b = t.philosophy.buckets;

  // Slider state: [taxable, deferred, exempt] summing to 100
  const [levels, setLevels] = useState([30, 60, 10]);

  const handleSliderChange = useCallback(
    (index: number, newValue: number) => {
      setLevels((prev) => {
        const clamped = Math.max(0, Math.min(100, newValue));
        const remaining = 100 - clamped;
        const otherIndices = [0, 1, 2].filter((i) => i !== index);
        const otherSum = otherIndices.reduce((s, i) => s + prev[i], 0);
        const next = [...prev];
        next[index] = clamped;

        if (otherSum === 0) {
          // distribute equally
          next[otherIndices[0]] = Math.round(remaining / 2);
          next[otherIndices[1]] = remaining - next[otherIndices[0]];
        } else {
          let distributed = 0;
          otherIndices.forEach((i, idx) => {
            if (idx === otherIndices.length - 1) {
              next[i] = remaining - distributed;
            } else {
              next[i] = Math.round((prev[i] / otherSum) * remaining);
              distributed += next[i];
            }
          });
        }
        return next;
      });
    },
    [],
  );

  const sliderLabels = [
    b.explanations?.[0]?.title ?? 'Taxable',
    b.explanations?.[1]?.title ?? 'Tax-Deferred',
    b.explanations?.[2]?.title ?? 'Tax-Exempt',
  ];

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-80 h-80 opacity-[0.04] pointer-events-none">
        <MorphingBlob colors={['hsl(43,74%,49%)', 'hsl(43,74%,60%)']} morphSpeed={12000} />
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 opacity-[0.03] pointer-events-none">
        <MorphingBlob colors={['hsl(160,48%,40%)', 'hsl(160,48%,25%)']} morphSpeed={15000} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(43,74%,49%)] to-transparent mx-auto mb-6" />
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-4">
            {b.badge}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-space font-bold leading-tight max-w-3xl mx-auto"
          >
            {b.headline}
          </motion.h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            {b.subheadline}
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: 3D Canvas + Sliders */}
          <div className="relative">
            <div className="relative h-[420px] md:h-[480px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
              <CanvasErrorBoundary
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex gap-8">
                      {BUCKET_COLORS.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-24 rounded-sm border-2 opacity-40"
                            style={{ borderColor: c }}
                          />
                          <span className="text-xs text-white/40 font-space">{levels[i]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex gap-8">
                        {BUCKET_COLORS.map((c, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div
                              className="w-16 h-24 rounded-sm border-2 opacity-40"
                              style={{ borderColor: c }}
                            />
                            <span className="text-xs text-white/40 font-space">{levels[i]}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <BucketCanvas levels={levels} />
                </Suspense>
              </CanvasErrorBoundary>
            </div>

            {/* Slider overlay */}
            <div className="mt-4 p-6 backdrop-blur-md bg-white/[0.06] border border-white/[0.08] rounded-2xl">
              <p className="text-xs font-space font-bold tracking-[0.2em] uppercase text-white/50 mb-4">
                {b.sliderLabel}
              </p>
              {sliderLabels.map((lbl, i) => (
                <TaxBucketSlider
                  key={i}
                  label={lbl}
                  value={levels[i]}
                  onChange={(v) => handleSliderChange(i, v)}
                  color={BUCKET_COLORS[i]}
                />
              ))}

              {/* Warning when tax-deferred > 50% */}
              {levels[1] > 50 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-[#EF4444]/10 border-l-4 border-[#EF4444] rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
                    <p className="text-xs text-[#EF4444] font-semibold">
                      {b.warningPrefix} {levels[1]}% {b.warningSuffix}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Explanation cards */}
          <div className="space-y-6">
            {b.explanations?.map(
              (
                exp: {
                  number: string;
                  title: string;
                  description: string;
                  taxRate: number;
                  taxLabel: string;
                  extraBadge?: string;
                },
                i: number,
              ) => (
                <motion.div
                  key={exp.number}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className={`p-6 md:p-8 backdrop-blur-md bg-white/[0.05] border border-white/[0.08] border-l-4 rounded-2xl ${BORDER_COLORS[i]} hover:bg-white/[0.08] transition-colors duration-300`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 ${BG_COLORS[i]} rounded-full flex items-center justify-center shrink-0`}
                    >
                      <span className="text-lg font-bold text-white font-space">
                        {exp.number}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-space font-bold">
                      {exp.title}
                    </h3>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <TaxRateBadge
                      rate={exp.taxRate}
                      label={exp.taxLabel}
                      color={BUCKET_COLORS[i]}
                    />
                    {exp.extraBadge && (
                      <span
                        className="text-xs font-space font-bold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${BUCKET_COLORS[i]}20`,
                          color: BUCKET_COLORS[i],
                        }}
                      >
                        {exp.extraBadge}
                      </span>
                    )}
                  </div>
                </motion.div>
              ),
            )}

            {/* Recommendation CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative p-6 md:p-8 overflow-hidden rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, hsl(160,48%,18%) 0%, hsl(43,74%,35%) 100%)',
              }}
            >
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative z-10">
                <CheckCircle className="w-10 h-10 text-white/80 mb-3" />
                <p className="text-lg font-space font-bold mb-2">
                  {b.recommendation?.title}
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {b.recommendation?.text}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
