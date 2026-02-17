import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { MorphingBlob } from './MorphingBlob';

export const PhilosophyHero: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const h = t.philosophy.hero;
  const containerRef = useRef<HTMLElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const blobRef3 = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (blobRef1.current) blobRef1.current.style.transform = `translate3d(${x * 30}px, ${y * 20}px, 0)`;
    if (blobRef2.current) blobRef2.current.style.transform = `translate3d(${x * -20}px, ${y * 25}px, 0)`;
    if (blobRef3.current) blobRef3.current.style.transform = `translate3d(${x * 15}px, ${y * -15}px, 0)`;
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="speakable-section relative min-h-screen flex items-center justify-center overflow-hidden bg-evergreen"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 animate-mesh-shift"
          style={{
            background: 'radial-gradient(ellipse at 20% 50%, hsla(160,48%,25%,0.6) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0 animate-mesh-shift"
          style={{
            background: 'radial-gradient(ellipse at 80% 30%, hsla(43,74%,49%,0.08) 0%, transparent 50%)',
            animationDelay: '4s',
          }}
        />
        <div
          className="absolute inset-0 animate-mesh-shift"
          style={{
            background: 'radial-gradient(ellipse at 50% 80%, hsla(160,48%,18%,0.5) 0%, transparent 60%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(160 48% 14%) 0%, hsl(160 48% 18%) 40%, hsl(160 48% 12%) 100%)',
          }}
        />
      </div>

      {/* Morphing blobs with parallax */}
      <div ref={blobRef1} className="absolute top-[10%] left-[5%] w-64 h-64 md:w-96 md:h-96 opacity-[0.12] pointer-events-none transition-transform duration-200 ease-out">
        <MorphingBlob colors={['hsl(160,48%,30%)', 'hsl(160,48%,20%)']} morphSpeed={10000} />
      </div>
      <div ref={blobRef2} className="absolute bottom-[10%] right-[5%] w-72 h-72 md:w-[28rem] md:h-[28rem] opacity-[0.08] pointer-events-none transition-transform duration-200 ease-out">
        <MorphingBlob colors={['hsl(43,74%,49%)', 'hsl(43,74%,60%)']} morphSpeed={12000} />
      </div>
      <div ref={blobRef3} className="absolute top-[40%] right-[25%] w-40 h-40 md:w-56 md:h-56 opacity-[0.06] pointer-events-none transition-transform duration-200 ease-out">
        <MorphingBlob colors={['hsl(160,48%,35%)', 'hsl(43,74%,49%)']} morphSpeed={14000} />
      </div>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Glassmorphic content card */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-[0_8px_60px_rgba(0,0,0,0.2)] px-8 md:px-16 py-16 md:py-24 text-center">
          {/* Badge */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-6"
          >
            {h.badge}
          </motion.p>

          {/* Animated gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-[2px] mx-auto mb-8 origin-center"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(43,74%,49%), transparent)' }}
          />

          {/* Headline with blur-to-sharp */}
          <motion.h1
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-8xl font-space font-bold text-white leading-[1.05] mb-8"
          >
            {h.headline}
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {h.paragraph}
          </motion.p>

          {/* CTAs with scale-up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => {
                const killersSection = document.getElementById('philosophy-killers');
                killersSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative overflow-hidden px-8 py-4 bg-white/[0.06] backdrop-blur-sm border border-white/[0.15] text-white font-space font-bold text-sm tracking-wide hover:bg-white/[0.12] transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {h.ctaPrimary}
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="group relative overflow-hidden px-8 py-4 bg-[hsl(43,74%,49%)] text-evergreen font-space font-bold text-sm tracking-wide hover:bg-[hsl(43,74%,55%)] transition-all duration-300 hover:shadow-[0_0_30px_hsla(43,74%,49%,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {h.ctaSecondary}
                <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
              {/* Hover gradient sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(43,74%,55%)] to-[hsl(160,48%,30%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-white/30" />
      </motion.div>
    </section>
  );
};
