import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const icons = [TrendingDown, Activity, Receipt];

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
  const { t } = useTranslation();
  const s = t.homepage.silentKillers;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
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
            {s.badge}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl">
            {s.headline}{' '}
            <span className="text-outline">{s.headlineHighlight}</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {s.killers.map((killer, idx) => {
            const Icon = icons[idx];
            return (
              <motion.div
                key={killer.id}
                variants={cardVariants}
                className="relative glass-card rounded-[60px] p-8 md:p-10 overflow-hidden group"
              >
                <span className="absolute top-6 right-8 text-[80px] font-space font-bold text-white/[0.03] leading-none select-none">
                  {killer.id}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-xl font-space font-bold text-white mb-3">{killer.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{killer.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-16 text-center">
          <p className="text-[6vw] md:text-[4vw] font-space font-bold text-white/[0.04] uppercase tracking-tight leading-none mb-8 select-none">
            {s.watermark}
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 bg-white text-evergreen font-space font-bold text-sm tracking-wide rounded-xl hover:bg-white/90 transition-colors"
          >
            {s.cta}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SilentKillers;
