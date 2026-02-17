import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

interface StatItemProps {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  index: number;
}

function StatItem({ value, prefix = '', suffix, label, index }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
            else setDone(true);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 text-center group hover:-translate-y-1 transition-transform duration-300 overflow-hidden"
    >
      {/* Inner top glow line */}
      <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <p className={`text-4xl sm:text-5xl md:text-6xl font-space font-bold whitespace-nowrap transition-all duration-300 ${done ? 'text-primary' : 'text-white'}`}
        style={{ textShadow: done ? '0 0 40px hsl(var(--primary) / 0.4), 0 0 80px hsl(var(--primary) / 0.2)' : 'none' }}
      >
        {prefix}{count}{suffix}
      </p>
      <p className="text-white/50 text-sm tracking-wide uppercase font-space mt-3">{label}</p>

      {/* Sparkle on complete */}
      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
          transition={{ duration: 0.8 }}
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"
        />
      )}
    </motion.div>
  );
}

export const Stats: React.FC = () => {
  const { t } = useTranslation();
  const stats = t.homepage.stats.items;

  return (
    <section className="relative py-20 md:py-28 px-4 bg-[hsl(160_80%_2%)] overflow-hidden">
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix}
              label={stat.label}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
