import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '@/i18n';

const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  return <span ref={ref}>{isInView ? value : 0}{suffix}</span>;
};

export const CSStats: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).clientStories?.stats;
  const stats = s || [
    { value: 98, suffix: '%', label: 'Client Satisfaction' },
    { value: 1200, suffix: '+', label: 'Families Served' },
    { value: 35, suffix: '+', label: 'Years Combined Experience' },
    { value: 75, suffix: '+', label: 'Carrier Partners' },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{(t as any).clientStories?.statsTitle || 'By The Numbers'}</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}>
              <p className="text-3xl md:text-4xl font-bold text-[hsl(43,74%,49%)]"><Counter value={stat.value} suffix={stat.suffix} /></p>
              <p className="text-white/60 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
