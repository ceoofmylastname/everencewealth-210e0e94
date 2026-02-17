import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, Unlock, TrendingUp, DollarSign } from 'lucide-react';
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
    <span ref={ref} className="text-3xl md:text-4xl font-space font-bold text-evergreen">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export const PhilosophyCashFlow: React.FC = () => {
  const { t } = useTranslation();
  const c = t.philosophy.cashFlow;

  const approaches = [
    {
      icon: Lock,
      title: c.netWorth.title,
      description: c.netWorth.description,
      stats: c.netWorth.stats,
      accent: 'bg-black/[0.04]',
      iconColor: 'text-[hsl(215,13%,40%)]',
      barWidth: '45%',
      barColor: 'bg-[hsl(215,13%,40%)]/30',
    },
    {
      icon: Unlock,
      title: c.cashFlowMobility.title,
      description: c.cashFlowMobility.description,
      stats: c.cashFlowMobility.stats,
      accent: 'bg-evergreen/[0.06]',
      iconColor: 'text-evergreen',
      barWidth: '85%',
      barColor: 'bg-evergreen/60',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-[hsl(90,5%,95%)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(43,74%,49%)] to-transparent mb-6" />
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-[hsl(215,13%,40%)]/60 mb-4">
            {c.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight max-w-3xl">
            {c.headline}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approaches.map((approach, idx) => {
            const Icon = approach.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className={`relative p-8 md:p-10 bg-white border border-black/[0.06] ${idx === 1 ? 'shadow-[0_8px_32px_rgba(26,77,62,0.08)]' : ''}`}
              >
                {idx === 1 && (
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-evergreen to-transparent" />
                )}

                <div className={`w-12 h-12 ${approach.accent} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${approach.iconColor}`} />
                </div>

                <h3 className="text-xl font-space font-bold text-evergreen mb-3">{approach.title}</h3>
                <p className="text-[hsl(215,13%,40%)] text-sm leading-relaxed mb-8">{approach.description}</p>

                {/* Visual bar */}
                <div className="mb-8">
                  <div className="text-xs text-[hsl(215,13%,40%)]/60 mb-2 font-space">{c.barLabel}</div>
                  <div className="h-3 bg-black/[0.04] w-full">
                    <motion.div
                      className={`h-full ${approach.barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: approach.barWidth }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + idx * 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {approach.stats.map((stat: { value: number; prefix: string; suffix: string; label: string }, si: number) => (
                    <div key={si}>
                      <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      <p className="text-xs text-[hsl(215,13%,40%)]/60 mt-1">{stat.label}</p>
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
