import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

export const CTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const c = t.homepage.cta;
  const images = useHomepageImages();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setBtnPos({ x, y });
  }, []);

  const words = c.headline.split(' ');

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
      {images.cta && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: `url(${images.cta})` }}
        />
      )}

      {/* Morphing gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          borderRadius: '40% 60% 60% 40% / 50% 40% 60% 50%',
          animation: 'morphOrb 12s ease-in-out infinite',
        }}
      />

      {/* Floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-[15%] w-16 h-16 border border-white/[0.05] rounded-2xl pointer-events-none"
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-[20%] w-10 h-10 border border-primary/10 rounded-full pointer-events-none"
        animate={{ y: [0, 15, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Staggered word reveal headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-primary/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {c.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-5"
        >
          {/* Primary CTA with magnetic hover + pulsing glow */}
          <motion.button
            ref={btnRef}
            onClick={() => navigate('/assessment')}
            onMouseMove={handleMouse}
            onMouseLeave={() => setBtnPos({ x: 0, y: 0 })}
            animate={{ x: btnPos.x, y: btnPos.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-evergreen font-semibold text-lg hover:brightness-110 transition-all"
            style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.15)' }}
          >
            <span className="absolute inset-0 rounded-full animate-ping opacity-15 bg-primary" style={{ animationDuration: '2.5s' }} />
            <span className="relative z-10">{c.primaryCta}</span>
          </motion.button>

          {/* Secondary CTA with glass + animated border */}
          <a
            href="tel:+14155551234"
            className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all"
          >
            <Phone className="w-5 h-5" />
            {c.secondaryCta}
          </a>
        </motion.div>
      </div>

      <style>{`
        @keyframes morphOrb {
          0%, 100% { border-radius: 40% 60% 60% 40% / 50% 40% 60% 50%; transform: translate(-50%, -50%) scale(1); }
          25% { border-radius: 50% 50% 40% 60% / 60% 50% 50% 40%; transform: translate(-50%, -50%) scale(1.05); }
          50% { border-radius: 60% 40% 50% 50% / 40% 60% 40% 60%; transform: translate(-50%, -50%) scale(0.95); }
          75% { border-radius: 45% 55% 55% 45% / 55% 45% 55% 45%; transform: translate(-50%, -50%) scale(1.02); }
        }
      `}</style>
    </section>
  );
};
