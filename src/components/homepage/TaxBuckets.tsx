import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const bucketIcons = [TrendingDown, Clock, Shield];
const bucketIconColors = ['text-red-400', 'text-yellow-400', 'text-primary'];

export const TaxBuckets: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tb = t.homepage.taxBuckets;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-dark-bg text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/55 mb-4">
            {tb.badge}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight">
            {tb.headline}{' '}
            <span className="text-outline">{tb.headlineHighlight}</span>
          </h2>
          <p className="text-white/55 mt-4 max-w-xl mx-auto font-space text-sm">
            {tb.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tb.buckets.map((bucket, idx) => {
            const Icon = bucketIcons[idx];
            const iconColor = bucketIconColors[idx];
            const highlight = idx === 2;
            return (
              <motion.div
                key={bucket.label}
                variants={cardVariants}
                className={`glass-card rounded-[50px] p-8 md:p-10 transition-transform duration-300 ${
                  highlight ? 'lg:scale-105 ring-1 ring-primary/30' : ''
                }`}
              >
                {highlight && (
                  <span className="inline-block mb-4 px-3 py-1 bg-primary/20 text-primary text-[10px] font-space font-bold tracking-[0.2em] uppercase rounded-full">
                    {tb.strategicPriority}
                  </span>
                )}
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <span className="text-[10px] font-space font-bold tracking-[0.3em] uppercase text-white/50 block mb-2">
                  {bucket.label}
                </span>
                <h3 className="text-xl font-space font-bold text-white mb-3">{bucket.title}</h3>
                <p className="text-white/70 text-sm mb-1 font-medium">{bucket.treatment}</p>
                <p className="text-white/55 text-sm">{bucket.examples}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-primary/50 italic font-serif text-lg mb-8 max-w-lg mx-auto">
            "{tb.quote}"
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3.5 border-2 border-white/20 text-white font-space font-semibold text-sm rounded-xl hover:bg-white/5 transition-colors"
          >
            {tb.cta}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TaxBuckets;
