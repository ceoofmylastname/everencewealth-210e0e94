import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { GlassCard } from './GlassCard';
import { useAnimatedCounter } from '@/hooks/useCountUp';
import { Helmet } from 'react-helmet';

export const PhilosophySpeakable: React.FC = () => {
  const { t } = useTranslation();
  const s = t.philosophy.speakable;
  const words = s.quote.split(' ');

  const counter = useAnimatedCounter(s.counterValue, { suffix: '+', duration: 2000 });

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    "cssSelector": ".speakable-philosophy-quote",
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>

      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'url(/patterns/dots.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="container max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-10 md:p-16 text-center relative" glow>
              {/* Decorative quote marks */}
              <div
                className="absolute top-4 left-6 text-[6rem] md:text-[8rem] leading-none font-serif select-none pointer-events-none"
                style={{ color: 'hsl(160, 48%, 21%)', opacity: 0.1 }}
              >
                &ldquo;
              </div>
              <div
                className="absolute bottom-4 right-6 text-[6rem] md:text-[8rem] leading-none font-serif select-none pointer-events-none"
                style={{ color: 'hsl(160, 48%, 21%)', opacity: 0.1 }}
              >
                &rdquo;
              </div>

              {/* Word-by-word reveal */}
              <div className="speakable-philosophy-quote relative z-10">
                <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-light" style={{ color: 'hsl(215, 10%, 35%)' }}>
                  {words.map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-[0.3em]"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </p>
              </div>

              {/* Animated counter */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-12 flex items-center justify-center gap-4"
              >
                <div
                  className="h-px w-12"
                  style={{ background: 'linear-gradient(to right, transparent, hsl(160, 48%, 21%))' }}
                />
                <div className="text-center" ref={counter.elementRef}>
                  <span
                    className="text-4xl md:text-5xl font-bold"
                    style={{ color: 'hsl(160, 48%, 21%)' }}
                  >
                    {counter.formattedValue}
                  </span>
                  <p className="text-sm mt-2" style={{ color: 'hsl(215, 10%, 45%)' }}>
                    {s.counterLabel}
                  </p>
                </div>
                <div
                  className="h-px w-12"
                  style={{ background: 'linear-gradient(to left, transparent, hsl(160, 48%, 21%))' }}
                />
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </>
  );
};
