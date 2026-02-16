import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

function AnimatedCounter({ target, prefix = '' }: { target: string; prefix?: string }) {
  const num = parseInt(target.replace(/[^0-9]/g, ''), 10) || 0;
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      setDisplay(Math.floor(v).toLocaleString());
    });
    return unsub;
  }, [spring]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        motionVal.set(num);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [num, motionVal]);

  return <span ref={ref}>{prefix}${display}</span>;
}

export const WakeUpCall: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const w = t.homepage.wakeUpCall;
  const btnRef = useRef<HTMLButtonElement>(null);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
    setBtnPos({ x, y });
  }, []);

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-white overflow-hidden">
      {/* Animated grid pattern background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-destructive">
              {w.badge}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold text-evergreen leading-tight max-w-3xl">
            {w.headline}{' '}
            <span className="text-destructive">{w.headlineHighlight}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {w.paragraph}
            </p>

            {/* Glassmorphic quote card */}
            <div className="relative bg-evergreen text-white rounded-3xl p-8 md:p-10 group hover:scale-[1.01] transition-transform duration-500">
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-3xl border border-white/10" />
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed mb-4 relative z-10" dangerouslySetInnerHTML={{ __html: `"${w.quote}"` }} />
              <p className="text-white/50 text-sm font-space relative z-10">{w.quoteAuthor}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="text-lg font-space font-bold text-foreground mb-6">
              {w.taxTrapsTitle}
            </h3>

            {/* Staggered tax trap items */}
            <ul className="space-y-4 mb-8">
              {w.taxTraps.map((trap, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-destructive shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{trap}</span>
                </motion.li>
              ))}
            </ul>

            {/* Animated stat counter */}
            <div className="bg-muted rounded-2xl p-6 mb-8">
              <p className="text-5xl md:text-6xl font-space font-bold text-evergreen">
                <AnimatedCounter target={w.stat} />
              </p>
              <p className="text-muted-foreground text-sm mt-2">{w.statLabel}</p>
            </div>

            {/* Magnetic hover CTA */}
            <motion.button
              ref={btnRef}
              onClick={() => navigate('/contact')}
              onMouseMove={handleMouse}
              onMouseLeave={() => setBtnPos({ x: 0, y: 0 })}
              animate={{ x: btnPos.x, y: btnPos.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative inline-flex items-center gap-2 px-6 py-3 bg-evergreen text-white font-space font-semibold text-sm rounded-xl overflow-hidden group"
            >
              {/* Gold shimmer on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(43_56%_57%/0.15)] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                {w.cta} <ChevronRight className="w-4 h-4" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WakeUpCall;
