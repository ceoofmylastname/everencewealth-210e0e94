import React, { useCallback, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, Activity, Receipt } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const icons = [TrendingDown, Activity, Receipt];

// Custom SVG chart components
const FeesChart: React.FC<{ animate: boolean }> = ({ animate }) => {
  const withoutFees = '0,100 30,88 60,75 90,62 120,48 150,33 180,18 210,2';
  const withFees = '0,100 30,92 60,84 90,76 120,68 150,60 180,52 210,44';
  return (
    <svg viewBox="0 0 210 110" className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fees-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(160,48%,30%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(160,48%,30%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={withoutFees}
        fill="none"
        stroke="hsl(160,48%,30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="400"
        strokeDashoffset={animate ? '0' : '400'}
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
      <polygon
        points={`0,110 ${withoutFees} 210,110`}
        fill="url(#fees-fill)"
        opacity={animate ? 1 : 0}
        style={{ transition: 'opacity 1s ease-out 0.5s' }}
      />
      <polyline
        points={withFees}
        fill="none"
        stroke="hsl(0,60%,55%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 4"
        opacity={animate ? 0.7 : 0}
        style={{ transition: 'opacity 1s ease-out 0.8s' }}
      />
    </svg>
  );
};

const VolatilityChart: React.FC<{ animate: boolean }> = ({ animate }) => {
  const points = '0,50 25,78 50,42 75,85 100,38 125,72 150,30 175,60 200,40';
  return (
    <svg viewBox="0 0 200 110" className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="vol-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(43,74%,49%)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(43,74%,49%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="hsl(43,74%,49%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="500"
        strokeDashoffset={animate ? '0' : '500'}
        style={{ transition: 'stroke-dashoffset 1.8s ease-out' }}
      />
      <polygon
        points={`0,110 ${points} 200,110`}
        fill="url(#vol-fill)"
        opacity={animate ? 1 : 0}
        style={{ transition: 'opacity 1s ease-out 0.5s' }}
      />
    </svg>
  );
};

const TaxChart: React.FC<{ animate: boolean }> = ({ animate }) => {
  const bars = [
    { x: 10, height: 80, color: 'hsl(215,13%,50%)', opacity: 0.35 },
    { x: 60, height: 52, color: 'hsl(215,13%,50%)', opacity: 0.35 },
    { x: 110, height: 80, color: 'hsl(215,13%,50%)', opacity: 0.35 },
    { x: 160, height: 4, color: 'hsl(160,48%,30%)', opacity: 0.8 },
  ];
  return (
    <svg viewBox="0 0 210 110" className="w-full h-28" preserveAspectRatio="none">
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={animate ? 105 - bar.height : 105}
          width="35"
          height={animate ? bar.height : 0}
          rx="2"
          fill={bar.color}
          opacity={bar.opacity}
          style={{ transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s` }}
        />
      ))}
    </svg>
  );
};

const charts = [FeesChart, VolatilityChart, TaxChart];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)' });

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({ transform: `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)` });
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)' });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ ...style, transition: 'transform 0.3s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  );
};

export const PhilosophyKillers: React.FC = () => {
  const { t } = useTranslation();
  const k = t.philosophy.killers;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section id="philosophy-killers" className="py-20 md:py-28 px-4 md:px-8 bg-[hsl(90,5%,95%)]">
      <div className="max-w-6xl mx-auto" ref={sectionRef}>
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

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {k.cards.map((card: { id: string; title: string; description: string; stat: string; statLabel: string }, idx: number) => {
            const Icon = icons[idx];
            const ChartComponent = charts[idx];
            return (
              <motion.div key={card.id} variants={cardVariants}>
                <TiltCard className="group relative bg-white border border-black/[0.06] p-8 md:p-10 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow duration-500">
                  {/* Glassmorphic hover overlay */}
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Animated top accent line */}
                  <motion.div
                    className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-evergreen/20 via-evergreen/50 to-transparent"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + idx * 0.15 }}
                  />

                  {/* Gold border glow on hover */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-[hsla(43,74%,49%,0.2)] transition-colors duration-500 pointer-events-none" />

                  <span className="absolute top-4 right-6 text-[72px] font-space font-bold text-black/[0.03] leading-none select-none">
                    {card.id}
                  </span>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-evergreen/[0.08] flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-evergreen" />
                    </div>

                    <h3 className="text-xl font-space font-bold text-evergreen mb-3">{card.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card.description}</p>

                    {/* Custom SVG chart */}
                    <div className="mb-4">
                      <ChartComponent animate={isInView} />
                    </div>

                    {/* Stat callout */}
                    <div className="border-t border-black/[0.06] pt-4">
                      <span className="text-2xl font-space font-bold text-evergreen">{card.stat}</span>
                      <span className="text-xs text-muted-foreground/60 ml-2">{card.statLabel}</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
