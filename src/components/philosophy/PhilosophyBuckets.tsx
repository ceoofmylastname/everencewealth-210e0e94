import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { MorphingBlob } from './MorphingBlob';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const colVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const featureVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' as const },
  }),
};

export const PhilosophyBuckets: React.FC = () => {
  const { t } = useTranslation();
  const b = t.philosophy.buckets;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-80 h-80 opacity-[0.04] pointer-events-none">
        <MorphingBlob colors={['hsl(43,74%,49%)', 'hsl(43,74%,60%)']} morphSpeed={12000} />
      </div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 opacity-[0.03] pointer-events-none">
        <MorphingBlob colors={['hsl(160,48%,40%)', 'hsl(160,48%,25%)']} morphSpeed={15000} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
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
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-space font-bold leading-tight max-w-3xl mx-auto"
          >
            {b.headline}
          </motion.h2>
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
          {b.columns.map((col: { id: string; name: string; subtitle: string; recommended: boolean; features: { label: string; included: boolean }[] }) => (
            <motion.div
              key={col.id}
              variants={colVariants}
              className={`relative p-8 md:p-10 backdrop-blur-md ${
                col.recommended
                  ? 'bg-white/[0.1] border border-[hsl(43,74%,49%)]/30 shadow-[0_0_50px_hsla(43,74%,49%,0.1)]'
                  : 'bg-white/[0.04] border border-white/[0.08]'
              } hover:bg-white/[0.08] transition-all duration-500 group`}
            >
              {/* Recommended shimmer border */}
              {col.recommended && (
                <>
                  <div className="absolute -top-px inset-x-0 h-[3px] overflow-hidden">
                    <div
                      className="h-full w-[200%] animate-shimmer"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, hsl(43,74%,49%) 25%, transparent 50%, hsl(43,74%,49%) 75%, transparent 100%)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-[hsl(43,74%,49%)]" fill="hsl(43,74%,49%)" />
                    <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-[hsl(43,74%,49%)]">
                      {b.recommended}
                    </span>
                  </div>
                </>
              )}

              <h3 className="text-2xl font-space font-bold mb-2">{col.name}</h3>
              <p className="text-white/50 text-sm mb-8">{col.subtitle}</p>

              <motion.ul
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {col.features.map((feat, fi) => (
                  <motion.li
                    key={fi}
                    custom={fi}
                    variants={featureVariants}
                    className="flex items-start gap-3"
                  >
                    {feat.included ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 400, delay: fi * 0.05 }}
                      >
                        <Check className="w-4 h-4 text-[hsl(160,48%,50%)] mt-0.5 shrink-0" />
                      </motion.div>
                    ) : (
                      <X className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm leading-relaxed ${feat.included ? 'text-white/80' : 'text-white/30'}`}>
                      {feat.label}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
