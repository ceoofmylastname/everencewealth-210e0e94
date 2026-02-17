import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { MorphingBlob } from './MorphingBlob';

const AnimatedQuoteReveal: React.FC<{ text: string }> = ({ text }) => {
  const ref = useRef<HTMLQuoteElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(' ');

  return (
    <blockquote ref={ref} className="text-3xl md:text-5xl font-light leading-relaxed italic text-white relative">
      {/* Decorative opening quote */}
      <span className="absolute -top-8 -left-4 text-[8rem] leading-none font-serif text-[hsla(43,74%,49%,0.15)] select-none pointer-events-none">
        &ldquo;
      </span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
      {/* Decorative closing quote */}
      <span className="text-[8rem] leading-none font-serif text-[hsla(43,74%,49%,0.15)] select-none pointer-events-none align-top ml-2">
        &rdquo;
      </span>
    </blockquote>
  );
};

export const PhilosophyQuote: React.FC = () => {
  const { t } = useTranslation();
  const q = t.philosophy.quote;

  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 bg-gradient-to-br from-evergreen via-[hsl(160,55%,12%)] to-black text-white overflow-hidden">
      {/* Background blob */}
      <div className="absolute top-10 right-10 w-96 h-96 opacity-[0.08] pointer-events-none">
        <MorphingBlob colors={['hsl(43,74%,49%)', 'hsl(160,48%,30%)']} morphSpeed={14000} />
      </div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[hsla(43,74%,49%,0.25)] pointer-events-none animate-float-particle"
          style={{
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 30}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${7 + i * 1.2}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Quote */}
        <div className="mb-16">
          <AnimatedQuoteReveal text={q.text} />
        </div>

        {/* Author card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="inline-block bg-white/[0.06] backdrop-blur-md border border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.2)] px-10 py-8 rounded-2xl"
        >
          <div className="flex items-center gap-6">
            {/* Avatar with initials */}
            <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-br from-[hsl(43,74%,49%)] to-evergreen flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl font-space">SR</span>
            </div>

            <div className="text-left">
              <p className="text-xl font-bold text-white mb-0.5">{q.author}</p>
              <p className="text-white/70 text-sm">{q.role}</p>
              <p className="text-white/50 text-xs">{q.company}</p>

              {/* Animated signature */}
              <motion.svg
                viewBox="0 0 200 50"
                className="w-40 h-10 mt-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.path
                  d="M10,35 C30,15 50,15 70,30 S110,45 130,25 S160,10 190,30"
                  fill="none"
                  stroke="hsl(43,74%,49%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: {
                      pathLength: 1,
                      opacity: 1,
                      transition: { duration: 2, ease: 'easeInOut', delay: 0.8 },
                    },
                  }}
                />
              </motion.svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
