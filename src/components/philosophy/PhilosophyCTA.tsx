import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { MorphingBlob } from './MorphingBlob';

export const PhilosophyCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const c = t.philosophy.cta;
  const btnRef = useRef<HTMLButtonElement>(null);

  // Magnetic button effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (btnRef.current) btnRef.current.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-gradient-to-b from-evergreen via-evergreen to-[hsl(160,48%,14%)] overflow-hidden">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[hsla(43,74%,49%,0.3)] pointer-events-none animate-float-particle"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${6 + i * 1.5}s`,
          }}
        />
      ))}

      {/* Background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] opacity-[0.04] pointer-events-none">
        <MorphingBlob colors={['hsl(43,74%,49%)', 'hsl(160,48%,30%)']} morphSpeed={12000} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Glassmorphic card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="bg-white/[0.06] backdrop-blur-md border border-white/[0.1] shadow-[0_8px_60px_rgba(0,0,0,0.2)] px-8 md:px-16 py-16 md:py-20 text-center"
        >
          {/* Animated gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[2px] mx-auto mb-8 origin-center"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(43,74%,49%), transparent)' }}
          />

          <h2 className="text-3xl md:text-5xl font-space font-bold text-white leading-tight mb-6">
            {c.headline}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {c.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <button
                ref={btnRef}
                onClick={() => navigate('/contact')}
                className="group px-8 py-4 bg-[hsl(43,74%,49%)] text-evergreen font-space font-bold text-sm tracking-wide hover:bg-[hsl(43,74%,55%)] transition-all duration-300 hover:shadow-[0_0_30px_hsla(43,74%,49%,0.4)]"
                style={{ transition: 'transform 0.2s ease-out, background-color 0.3s, box-shadow 0.3s' }}
              >
                <span className="flex items-center justify-center gap-2">
                  {c.primaryCta}
                  <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                </span>
              </button>
            </div>
            <a
              href="tel:+14155550100"
              className="group px-8 py-4 border border-white/20 text-white font-space font-bold text-sm tracking-wide hover:border-white/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                {c.secondaryCta}
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
