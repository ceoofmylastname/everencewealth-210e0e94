import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

interface StatItemProps {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

function StatItem({ value, prefix = '', suffix, label }: StatItemProps) {
  const [count, setCount] = useState(0);
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
    <div ref={ref} className="flex-1 text-center px-6 py-10">
      <p className="text-5xl md:text-7xl font-space font-bold text-evergreen">
        {prefix}{count}{suffix}
      </p>
      <p className="text-muted-foreground text-sm tracking-wide uppercase font-space mt-2">{label}</p>
    </div>
  );
}

export const Stats: React.FC = () => {
  const { t } = useTranslation();
  const stats = t.homepage.stats.items;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-2xl">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
