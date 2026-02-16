import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RETIREMENT_LETTERS = 'RETIREMENT'.split('');

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
        <p className="text-[10px] font-space font-bold tracking-[0.4em] uppercase text-white/20 [writing-mode:vertical-lr] rotate-180">
          Wealth Architecture
        </p>
      </motion.div>
      <motion.div
        className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10"
        initial={{ opacity: 0, x: 40 }}
        animate={stage >= 2 ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[10px] font-space font-bold tracking-[0.4em] uppercase text-white/20 [writing-mode:vertical-lr]">
          Strategic Fiduciary
        </p>
      </motion.div>

      {/* Corner decorations */}

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
      <div className="relative z-10 container mx-auto px-4 text-center pt-20 md:pt-24 pb-24 md:pb-32">
        {/* Top badge */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-space font-semibold tracking-[0.3em] uppercase text-white/40">
            Established 1998 · Independent Fiduciary
          </span>
        </motion.div>

        <div className="leading-none -space-y-2 md:-space-y-4">
          <h1 className="font-space font-bold uppercase tracking-tight">
            {/* BRIDGE the — same line */}
            <motion.span
              className="flex items-baseline justify-center gap-3 md:gap-4"
              initial={{ opacity: 0, x: -60, filter: 'blur(12px)' }}
              animate={stage >= 1 ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[12vw] md:text-[9vw] lg:text-[7vw] text-white font-bold">BRIDGE</span>
              <span className="text-[5vw] md:text-[3.5vw] lg:text-[2.8vw] text-white/50 font-light">the</span>
            </motion.span>

            {/* RETIREMENT — letter by letter */}
            <span className="block text-[15vw] md:text-[11vw] lg:text-[9vw] overflow-hidden">
              {RETIREMENT_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent hero-glow"
                  initial={{ opacity: 0, y: 60, rotateX: -90 }}
                  animate={stage >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : {}}
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
              className="block text-[18vw] md:text-[13vw] lg:text-[10vw] text-outline"
              initial={{ opacity: 0, y: 100, scale: 2.5 }}
              animate={stage >= 3 ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                mass: 1.2,
              }}
            >
              GAP
            </motion.span>
          </h1>
        </div>

        {/* Subline */}
        <motion.div
          className="mt-4 max-w-xl mx-auto space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="text-base md:text-lg font-space">
            <span className="text-white/80">Stop funding Wall Street's wealth.</span>
            <br />
            <span className="text-primary italic">Start building yours.</span>
          </div>
          <p className="text-[10px] font-space font-semibold tracking-[0.2em] uppercase text-white/25 max-w-md mx-auto leading-relaxed">
            You've been sold a myth. Save and hope? That's a gamble. We reclaim control.
          </p>
        </motion.div>
      </div>

      {/* Bottom HUD panel */}
      <motion.div
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-4xl"
        initial={{ opacity: 0, y: 80 }}
        animate={stage >= 4 ? { opacity: 1, y: 0 } : {}}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 1 }}
      >
        <div className="glass-card rounded-2xl px-6 py-4 md:px-8 md:py-5 grid grid-cols-1 md:grid-cols-3 items-center gap-4 md:gap-6">
          {/* Left */}
          <div className="text-center md:text-left">
            <span className="block text-[9px] font-space font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">System Status</span>
            <span className="flex items-center justify-center md:justify-start gap-2 text-[11px] font-space font-bold tracking-[0.15em] uppercase text-white/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Analysis Active
            </span>
          </div>
          {/* Center */}
          <div className="text-center border-y md:border-y-0 md:border-x border-white/[0.06] py-3 md:py-0 md:px-4">
            <span className="block text-[9px] font-space font-semibold tracking-[0.25em] uppercase text-white/30 mb-1">Current Protocol</span>
            <span className="text-[11px] font-space font-bold tracking-[0.1em] uppercase text-white/60">Tax-Free Bucket Optimization</span>
          </div>
          {/* Right */}
          <div className="text-center md:text-right">
            <a
              href="/assessment"
              className="inline-block px-6 py-2.5 border border-white/15 bg-white/[0.03] text-white/70 font-space font-semibold text-[11px] tracking-[0.15em] uppercase rounded-xl hover:bg-white/[0.06] hover:border-primary/30 transition-colors"
            >
              Begin Assessment
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
