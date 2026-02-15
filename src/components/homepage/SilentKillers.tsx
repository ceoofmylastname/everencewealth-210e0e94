import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Receipt } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const FeesVisual = () => (
  <div className="mt-6 space-y-3">
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="w-16 shrink-0">0.5% fee</span>
      <motion.div
        className="h-5 rounded bg-[#1A4D3E]"
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="w-16 shrink-0">2% fee</span>
      <motion.div
        className="h-5 rounded bg-red-400"
        initial={{ width: 0 }}
        whileInView={{ width: '58%' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
    <p className="text-[10px] text-slate-400 mt-1">Portfolio value after 30 years</p>
  </div>
);

const VolatilityVisual = () => (
  <div className="mt-6">
    <svg viewBox="0 0 200 60" className="w-full h-14" fill="none">
      <motion.path
        d="M0,30 L30,30 L50,55 L80,55 L120,10 L160,30 L200,30"
        stroke="#1A4D3E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <motion.path
        d="M0,30 L30,30 L50,55 L80,55 L120,10 L160,30 L200,30"
        stroke="#1A4D3E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.15}
      />
    </svg>
    <p className="text-[10px] text-slate-400 mt-1">50% loss → needs 100% gain to recover</p>
  </div>
);

const TaxesVisual = () => (
  <div className="mt-6 space-y-2">
    {[
      { label: '22%', width: '45%' },
      { label: '32%', width: '70%' },
      { label: '35%+', width: '100%' },
    ].map((bracket, i) => (
      <div key={bracket.label} className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-10 shrink-0 text-right">{bracket.label}</span>
        <motion.div
          className="h-4 rounded bg-[#1A4D3E]"
          style={{ opacity: 0.5 + i * 0.25 }}
          initial={{ width: 0 }}
          whileInView={{ width: bracket.width }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.15 }}
        />
      </div>
    ))}
    <p className="text-[10px] text-slate-400 mt-1">RMD-driven bracket creep</p>
  </div>
);

const killers = [
  {
    icon: TrendingDown,
    label: 'FEES',
    stat: '2% annual fees can cost you $400K+ over 30 years',
    example: 'A $500K portfolio with 2% fees vs 0.5% fees',
    Visual: FeesVisual,
  },
  {
    icon: Activity,
    label: 'VOLATILITY',
    stat: 'Market crashes require 100% gains to recover from 50% losses',
    example: 'The math of recovery time',
    Visual: VolatilityVisual,
  },
  {
    icon: Receipt,
    label: 'TAXES',
    stat: 'RMDs can push retirees into 35%+ tax brackets',
    example: 'Traditional IRA tax time bomb',
    Visual: TaxesVisual,
  },
];

export const SilentKillers: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-5xl font-serif font-bold text-center text-slate-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The Three Silent Killers Eroding Your Wealth
        </motion.h2>
        <motion.p
          className="text-center text-slate-500 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Most investors don't realize how much they're losing to these hidden forces — until it's too late.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {killers.map(({ icon: Icon, label, stat, example, Visual }) => (
            <motion.div
              key={label}
              variants={cardVariants}
              className="bg-white rounded-xl border border-[#1A4D3E]/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#1A4D3E]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#1A4D3E]" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-[#1A4D3E] uppercase">
                  {label}
                </span>
              </div>
              <p className="font-semibold text-slate-900 leading-snug mb-2">{stat}</p>
              <p className="text-sm text-slate-500">{example}</p>
              <Visual />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SilentKillers;
