import React, { useState, useEffect, useRef } from 'react';

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

export const Stats: React.FC = () => (
  <section className="py-16 px-4 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border border border-border rounded-2xl">
        <StatItem value={500} prefix="$" suffix="M+" label="Assets Protected" />
        <StatItem value={98} suffix="%" label="Client Satisfaction" />
        <StatItem value={25} suffix="+" label="Years Experience" />
        <StatItem value={75} suffix="+" label="Insurance Carriers" />
      </div>
    </div>
  </section>
);
