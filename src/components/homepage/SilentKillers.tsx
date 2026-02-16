import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const killers = [
  {
    id: '01',
    icon: TrendingDown,
    title: 'Hidden Fees',
    description: '2% annual fees can cost you $400K+ over 30 years. Most investors never see the true cost buried in fund expense ratios and advisory charges.',
  },
  {
    id: '02',
    icon: Activity,
    title: 'Market Volatility',
    description: 'A 50% loss requires a 100% gain just to break even. Sequence-of-returns risk can devastate portfolios at the worst possible time.',
  },
  {
    id: '03',
    icon: Receipt,
    title: 'Tax Drag',
    description: 'RMDs can push retirees into 35%+ tax brackets. The IRS takes their cut every year, compounding the damage over decades.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export const SilentKillers: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsla(160,48%,30%,0.2),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsla(160,48%,30%,0.1),_transparent_60%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-4">
            Wealth Erosion
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl">
            Three Silent Forces{' '}
            <span className="text-outline">Attack.</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {killers.map(({ id, icon: Icon, title, description }) => (
            <motion.div
              key={id}
              variants={cardVariants}
              className="relative glass-card rounded-[60px] p-8 md:p-10 overflow-hidden group"
            >
              {/* Watermark number */}
              <span className="absolute top-6 right-8 text-[80px] font-space font-bold text-white/[0.03] leading-none select-none">
                {id}
              </span>

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-white/80" />
              </div>

              <h3 className="text-xl font-space font-bold text-white mb-3">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom watermark + CTA */}
        <div className="mt-16 text-center">
          <p className="text-[6vw] md:text-[4vw] font-space font-bold text-white/[0.04] uppercase tracking-tight leading-none mb-8 select-none">
            Reclaim Control
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 bg-white text-evergreen font-space font-bold text-sm tracking-wide rounded-xl hover:bg-white/90 transition-colors"
          >
            Protect Your Wealth
          </button>
        </div>
      </div>
    </section>
  );
};

export default SilentKillers;
