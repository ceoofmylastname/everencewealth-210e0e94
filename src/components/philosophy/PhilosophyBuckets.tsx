import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const colVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export const PhilosophyBuckets: React.FC = () => {
  const { t } = useTranslation();
  const b = t.philosophy.buckets;

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(43,74%,49%)] to-transparent mx-auto mb-6" />
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-4">
            {b.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold leading-tight max-w-3xl mx-auto">
            {b.headline}
          </h2>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            {b.subheadline}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {b.columns.map((col: { id: string; name: string; subtitle: string; recommended: boolean; features: { label: string; included: boolean }[] }, idx: number) => (
            <motion.div
              key={col.id}
              variants={colVariants}
              className={`relative p-8 md:p-10 border ${
                col.recommended
                  ? 'border-[hsl(43,74%,49%)]/40 bg-white/[0.08] shadow-[0_0_40px_hsla(43,74%,49%,0.1)]'
                  : 'border-white/[0.08] bg-white/[0.03]'
              }`}
            >
              {col.recommended && (
                <div className="absolute -top-px inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[hsl(43,74%,49%)] to-transparent" />
              )}

              {col.recommended && (
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-[hsl(43,74%,49%)]" fill="hsl(43,74%,49%)" />
                  <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-[hsl(43,74%,49%)]">
                    {b.recommended}
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-space font-bold mb-2">{col.name}</h3>
              <p className="text-white/50 text-sm mb-8">{col.subtitle}</p>

              <ul className="space-y-4">
                {col.features.map((feat, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    {feat.included ? (
                      <Check className="w-4 h-4 text-[hsl(160,48%,50%)] mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm leading-relaxed ${feat.included ? 'text-white/80' : 'text-white/30'}`}>
                      {feat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
