import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const floatingShapes = [
  { type: 'square', x: '12%', y: '18%', size: 60, rotation: 45, delay: 0, duration: 18 },
  { type: 'circle', x: '78%', y: '25%', size: 40, rotation: 0, delay: 2, duration: 22 },
  { type: 'diamond', x: '65%', y: '70%', size: 50, rotation: 30, delay: 1, duration: 20 },
  { type: 'square', x: '20%', y: '75%', size: 35, rotation: 60, delay: 3, duration: 16 },
  { type: 'circle', x: '88%', y: '55%', size: 28, rotation: 0, delay: 1.5, duration: 24 },
  { type: 'diamond', x: '40%', y: '12%', size: 32, rotation: 15, delay: 0.5, duration: 19 },
];

export const PhilosophyHero: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const h = t.philosophy.hero;

  return (
    <section className="speakable-section relative min-h-screen flex items-center justify-center overflow-hidden bg-evergreen">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(160 48% 18%) 0%, hsl(160 48% 12%) 40%, hsl(160 48% 20%) 70%, hsl(160 48% 15%) 100%)',
          animation: 'gradient-shift 12s ease-in-out infinite alternate',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(43,74%,49%,0.06),_transparent_70%)]" />

      {/* Floating geometric shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [shape.rotation, shape.rotation + 90, shape.rotation],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: 'easeInOut',
          }}
        >
          {shape.type === 'square' && (
            <div
              className="border border-white/[0.08]"
              style={{ width: shape.size, height: shape.size }}
            />
          )}
          {shape.type === 'circle' && (
            <div
              className="rounded-full border border-white/[0.06]"
              style={{ width: shape.size, height: shape.size }}
            />
          )}
          {shape.type === 'diamond' && (
            <div
              className="border border-[hsla(43,74%,49%,0.1)] rotate-45"
              style={{ width: shape.size, height: shape.size }}
            />
          )}
        </motion.div>
      ))}

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-6"
        >
          {h.badge}
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-space font-bold text-white leading-tight mb-8"
        >
          {h.headline}
        </motion.h1>

        {/* Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          {h.paragraph}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => {
              const killersSection = document.getElementById('philosophy-killers');
              killersSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group px-8 py-4 bg-white/[0.08] backdrop-blur-sm border border-white/[0.15] text-white font-space font-bold text-sm tracking-wide hover:bg-white/[0.12] transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              {h.ctaPrimary}
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="group px-8 py-4 bg-[hsl(43,74%,49%)] text-evergreen font-space font-bold text-sm tracking-wide hover:bg-[hsl(43,74%,55%)] transition-all duration-300 hover:shadow-[0_0_24px_hsla(43,74%,49%,0.3)]"
          >
            <span className="flex items-center justify-center gap-2">
              {h.ctaSecondary}
              <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </span>
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-white/30" />
      </motion.div>

      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </section>
  );
};
