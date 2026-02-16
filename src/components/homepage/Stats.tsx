import React from 'react';
import { useAnimatedCounter } from '@/hooks/useCountUp';
import { ScrollReveal } from './ScrollReveal';

const metrics = [
  { value: 27, suffix: '+', label: 'Years of Experience', prefix: '' },
  { value: 1200, suffix: '+', label: 'Families Served', prefix: '' },
  { value: 75, suffix: '+', label: 'Insurance Carriers', prefix: '' },
  { value: 500, suffix: 'M+', label: 'Assets Protected', prefix: '$' },
];

function StatItem({ value, suffix, prefix, label }: { value: number; suffix: string; prefix: string; label: string }) {
  const counter = useAnimatedCounter(value, { suffix, prefix, duration: 2500 });

  return (
    <div className="flex-1 text-center px-6 py-8" ref={counter.elementRef}>
      <p className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2">
        {counter.formattedValue}
      </p>
      <p className="text-white/50 text-sm tracking-wide uppercase">{label}</p>
    </div>
  );
}

export const Stats: React.FC = () => (
  <section className="relative py-16 bg-[hsl(160_80%_2%)]">
    <div className="container mx-auto px-6">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 border border-white/10 rounded-2xl glass-card">
          {metrics.map((m) => (
            <StatItem key={m.label} {...m} />
          ))}
        </div>
      </ScrollReveal>
    </div>
  </section>
);
