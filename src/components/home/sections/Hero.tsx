import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 6,
  duration: 6 + Math.random() * 8,
  color: i % 3 === 0 ? 'hsla(45, 60%, 55%, 0.4)' : 'hsla(160, 48%, 40%, 0.35)',
}));

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const hp = t.homepage.hero;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1400),
      setTimeout(() => setStage(4), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const RETIREMENT_LETTERS = 'RETIREMENT'.split('');

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-dark-bg">
      {/* Mesh gradient layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[60vw] h-[60vw] rounded-full animate-mesh-shift"
          style={{
            top: '10%',
            left: '-10%',
            background: 'radial-gradient(circle, hsla(160, 48%, 25%, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute w-[50vw] h-[50vw] rounded-full animate-mesh-shift"
          style={{
            bottom: '0%',
            right: '-15%',
            background: 'radial-gradient(circle, hsla(160, 48%, 30%, 0.08) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDelay: '4s',
            animationDuration: '12s',
          }}
        />
      </div>

      {/* Scan line */}
      {stage >= 1 && <div className="scan-line" />}

      {/* Particles */}
      <AnimatePresence>
        {stage >= 4 && PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="hero-particle"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: p.delay * 0.15, duration: 0.6 }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Decorative side text */}
      <motion.div
        className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs md:text-sm font-space font-bold tracking-[0.5em] uppercase text-white/30 [writing-mode:vertical-lr] rotate-180">
          {hp.sideLeft}
        </p>
      </motion.div>
      <motion.div
        className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: 40 }}
        animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs md:text-sm font-space font-bold tracking-[0.5em] uppercase text-white/30 [writing-mode:vertical-lr]">
          {hp.sideRight}
        </p>
      </motion.div>

      {/* Center dot (stage 0) */}
      <motion.div
        className="absolute z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          stage === 0
            ? { scale: 1, opacity: 1 }
            : { scale: 80, opacity: 0 }
        }
        transition={
          stage === 0
            ? { duration: 0.3, ease: 'easeOut' }
            : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 md:pt-16 pb-28 md:pb-24 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Top badge */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-hero font-medium tracking-[0.3em] uppercase text-white/40">
            {hp.badge}
          </span>
        </motion.div>

        <div className="leading-none -space-y-2 md:-space-y-3">
          <h1 className="font-hero font-black uppercase tracking-tighter">
            {/* BRIDGE the — same line */}
            <motion.span
              className="flex items-baseline justify-center gap-3 md:gap-5"
              initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
              animate={stage >= 1 ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[13vw] md:text-[8vw] lg:text-[6.5vw] text-white">{hp.bridge}</span>
              <span className="text-[5vw] md:text-[3vw] lg:text-[2.4vw] text-white/40 font-light tracking-normal italic font-serif">{hp.the}</span>
            </motion.span>

            {/* RETIREMENT — letter by letter with rounded pill style */}
            <span className="flex items-center justify-center gap-[0.5vw] md:gap-[0.4vw] overflow-hidden py-2">
              {RETIREMENT_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-flex items-center justify-center retirement-letter-pill"
                  initial={{ opacity: 0, y: 60, scale: 0.5 }}
                  animate={stage >= 2 ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>

            {/* GAP — slam */}
            <motion.span
              className="block text-[22vw] md:text-[16vw] lg:text-[13vw] text-outline leading-[0.8]"
              initial={{ opacity: 0, y: 100, scale: 2.5 }}
              animate={stage >= 3 ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                mass: 1.2,
              }}
            >
              {hp.gap}
            </motion.span>
          </h1>
        </div>

        {/* Subline */}
        <motion.div
          className="mt-4 max-w-xl mx-auto space-y-2"
          initial={{ opacity: 0, y: 30 }}
          animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-sm md:text-base font-hero font-medium">
            <span className="text-white/80">{hp.subline1}</span>
            <br />
            <span className="text-primary italic">{hp.subline2}</span>
          </div>
          <p className="text-[9px] font-hero font-semibold tracking-[0.2em] uppercase text-white/25 max-w-md mx-auto leading-relaxed">
            {hp.sublineSmall}
          </p>
        </motion.div>
      </div>

      {/* Bottom HUD panel */}
      <motion.div
        className="absolute bottom-4 md:bottom-8 inset-x-0 z-20 flex justify-center px-4"
        initial={{ opacity: 0, y: 80 }}
        animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 1 }}
      >
        <div className="glass-card rounded-2xl px-6 py-4 md:px-8 md:py-5 grid grid-cols-1 md:grid-cols-3 items-center gap-4 md:gap-6 w-full max-w-3xl">
          {/* Left */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="block text-[9px] font-hero font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">{hp.systemStatus}</span>
            <span className="flex items-center gap-2 text-[11px] font-hero font-bold tracking-[0.15em] uppercase text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {hp.analysisActive}
            </span>
          </div>
          {/* Center */}
          <div className="flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-white/[0.06] py-3 md:py-0 md:px-4">
            <span className="block text-[9px] font-hero font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">{hp.currentProtocol}</span>
            <span className="text-[11px] font-hero font-bold tracking-[0.1em] uppercase text-white/60">{hp.protocolName}</span>
          </div>
          {/* Right */}
          <div className="flex items-center justify-center">
            <a
              href="/assessment"
              className="inline-block px-6 py-2.5 border border-white/15 bg-white/[0.03] text-white/70 font-hero font-bold text-[11px] tracking-[0.15em] uppercase rounded-xl hover:bg-white/[0.06] hover:border-primary/30 transition-colors"
            >
              {hp.beginAssessment}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
