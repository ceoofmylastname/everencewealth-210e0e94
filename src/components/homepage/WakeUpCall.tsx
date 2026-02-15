import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useCountUp';

const stats = [
  { value: 67, suffix: '%', label: 'of Americans are behind on retirement savings', icon: TrendingDown },
  { value: 1.2, suffix: 'M', prefix: '$', decimals: 1, label: 'average retirement gap for middle-class families', icon: DollarSign },
  { value: 72, suffix: '%', label: "don't understand how taxes will impact retirement income", icon: AlertTriangle },
];

function StatCard({ value, suffix, prefix, decimals, label, icon: Icon, delay }: {
  value: number; suffix: string; prefix?: string; decimals?: number; label: string; icon: React.ElementType; delay: number;
}) {
  const counter = useAnimatedCounter(value, { suffix, prefix, decimals, duration: 2500, delay: 0 });

  return (
    <motion.div
      ref={counter.elementRef}
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay }}
      className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
    >
      <Icon className="mx-auto mb-4 h-8 w-8 text-emerald-300/80" />
      <p className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
        {counter.formattedValue}
      </p>
      <p className="text-emerald-100/70 text-sm md:text-base leading-relaxed">{label}</p>
    </motion.div>
  );
}

export const WakeUpCall: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-[#1A4D3E] relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
            The Retirement Crisis Wall Street Won't Tell You About
          </h2>
          <p className="text-emerald-100/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
            While they promise 8% returns, the math tells a different story
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} delay={i * 0.15} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/assessment')}
            className="px-8 py-4 bg-white text-[#1A4D3E] font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg shadow-black/20 text-base"
          >
            See Your Retirement Gap
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WakeUpCall;
