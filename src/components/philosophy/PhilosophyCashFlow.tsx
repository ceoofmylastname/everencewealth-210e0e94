import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const AnimatedCounter: React.FC<{ target: number; prefix?: string; suffix?: string; duration?: number }> = ({
  target, prefix = '', suffix = '', duration = 2,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-space font-bold text-evergreen tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// SVG arc gauge
const ArcGauge: React.FC<{ percent: number; animate: boolean; color: string; label: string }> = ({
  percent, animate, color, label,
}) => {
  const radius = 60;
  const circumference = Math.PI * radius; // semi-circle
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 80" className="w-full max-w-[180px]">
        {/* Background arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke="hsl(0,0%,90%)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Animated arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={animate ? offset : circumference}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)' }}
        />
        <text x="70" y="65" textAnchor="middle" className="fill-evergreen font-space font-bold text-xl">
          {animate ? `${percent}%` : '0%'}
        </text>
      </svg>
      <span className="text-xs text-muted-foreground/60 mt-1 font-space">{label}</span>
    </div>
  );
};

export const PhilosophyCashFlow: React.FC = () => {
  const { t } = useTranslation();
  const c = t.philosophy.cashFlow;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const approaches = [
    {
      icon: Lock,
      title: c.netWorth.title,
      description: c.netWorth.description,
      stats: c.netWorth.stats,
      accent: 'bg-black/[0.04]',
      iconColor: 'text-muted-foreground',
      arcPercent: 45,
      arcColor: 'hsl(215,13%,50%)',
    },
    {
      icon: Unlock,
      title: c.cashFlowMobility.title,
      description: c.cashFlowMobility.description,
      stats: c.cashFlowMobility.stats,
      accent: 'bg-evergreen/[0.06]',
      iconColor: 'text-evergreen',
      arcPercent: 85,
      arcColor: 'hsl(160,48%,30%)',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-[hsl(90,5%,95%)]">
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
            {c.badge}
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight max-w-3xl"
          >
            {c.headline}
          </motion.h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Decorative connecting line */}
          <svg className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-px pointer-events-none z-20">
            <line x1="0" y1="0" x2="64" y2="0" stroke="hsl(43,74%,49%)" strokeWidth="2" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
            </line>
          </svg>

          {approaches.map((approach, idx) => {
            const Icon = approach.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className={`relative p-8 md:p-10 bg-white border border-black/[0.06] hover:border-[hsla(43,74%,49%,0.2)] transition-all duration-500 group ${
                  idx === 1 ? 'shadow-[0_8px_32px_rgba(26,77,62,0.08)] hover:shadow-[0_8px_40px_hsla(43,74%,49%,0.12)]' : ''
                }`}
              >
                {idx === 1 && (
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-evergreen to-transparent" />
                )}

                {/* Pulsing gold shadow for cash flow card */}
                {idx === 1 && (
                  <div className="absolute inset-0 shadow-[0_0_30px_hsla(43,74%,49%,0.08)] animate-pulse-subtle pointer-events-none" />
                )}

                <div className={`w-12 h-12 ${approach.accent} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${approach.iconColor}`} />
                </div>

                <h3 className="text-xl font-space font-bold text-evergreen mb-3">{approach.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">{approach.description}</p>

                {/* SVG Arc Gauge */}
                <div className="mb-8">
                  <ArcGauge
                    percent={approach.arcPercent}
                    animate={isInView}
                    color={approach.arcColor}
                    label={c.barLabel}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {approach.stats.map((stat: { value: number; prefix: string; suffix: string; label: string }, si: number) => (
                    <div key={si}>
                      <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      <p className="text-xs text-muted-foreground/60 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
