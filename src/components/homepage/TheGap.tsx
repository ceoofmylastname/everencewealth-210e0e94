import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, BarChart3, Receipt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const gapIcons = [PiggyBank, BarChart3, Receipt];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const TheGap: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tg = t.homepage.theGap;

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-light-gray">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-evergreen/50 mb-4">
            {tg.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground leading-tight">
            {tg.headline}{' '}
            <span className="text-evergreen">{tg.headlineHighlight}</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tg.gaps.map((gap, idx) => {
            const Icon = gapIcons[idx];
            return (
              <motion.div
                key={gap.title}
                variants={cardVariants}
                className="bg-white rounded-[40px] p-8 md:p-10 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-evergreen/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-evergreen" />
                </div>
                <h3 className="text-xl font-space font-bold text-foreground mb-3">{gap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{gap.description}</p>
                <div>
                  <p className="text-3xl font-space font-bold text-destructive">{gap.stat}</p>
                  <p className="text-muted-foreground text-xs mt-1">{gap.statLabel}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-evergreen rounded-[60px] p-8 md:p-12 lg:p-16 text-white"
        >
          <h3 className="text-2xl md:text-3xl font-space font-bold mb-8">
            {tg.bridgeTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {tg.bridgeSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl font-space font-bold text-white/20 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-white/80 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-evergreen font-space font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
          >
            {tg.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
