import React from 'react';
import { motion, useInView } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

/* ── Floating particles ────────────────────────────────────── */
const FloatingParticles: React.FC<{ direction: 'up' | 'down'; color: string }> = ({ direction, color }) => {
  const seeds = [
    { x: '10%', size: 6, delay: 0, dur: 7 },
    { x: '25%', size: 4, delay: 1.2, dur: 9 },
    { x: '45%', size: 5, delay: 0.5, dur: 8 },
    { x: '65%', size: 3, delay: 2, dur: 10 },
    { x: '80%', size: 6, delay: 0.8, dur: 7.5 },
    { x: '90%', size: 4, delay: 1.8, dur: 9 },
  ];

  return (
    <>
      {seeds.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: s.x,
            width: s.size,
            height: s.size,
            backgroundColor: color,
            top: direction === 'down' ? '-5%' : undefined,
            bottom: direction === 'up' ? '-5%' : undefined,
          }}
          animate={{
            y: direction === 'down' ? [0, 600] : [0, -600],
            opacity: [0, 0.5, 0.3, 0],
          }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </>
  );
};

/* ── Comparison item ───────────────────────────────────────── */
interface ComparisonItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  fromX?: number;
}

const ComparisonItem: React.FC<ComparisonItemProps> = ({ icon, title, description, delay, fromX = -30 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="flex items-start gap-4"
      initial={{ opacity: 0, x: fromX }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="opacity-80 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

/* ── Main section ──────────────────────────────────────────── */
export const PhilosophyWallStreet: React.FC = () => {
  const { t } = useTranslation();
  const ws = (t.philosophy as any).wallStreet;

  const dividerRef = React.useRef<HTMLDivElement>(null);
  const dividerInView = useInView(dividerRef, { once: true, margin: '-100px' });

  return (
    <section id="philosophy-wallstreet" className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-0">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-[hsl(var(--evergreen))] text-center mb-16 md:mb-20 px-6"
        >
          {ws.headline}
        </motion.h2>

        <div className="relative" ref={dividerRef}>
          {/* Center divider – desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px overflow-hidden z-10">
            <motion.div
              className="h-full w-full bg-gradient-to-b from-transparent via-[hsl(var(--evergreen))] to-transparent"
              initial={{ scaleY: 0 }}
              animate={dividerInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ─── LEFT: Wall Street (dark) ─── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-slate-900 text-white p-10 md:p-16 relative overflow-hidden"
            >
              <FloatingParticles direction="down" color="hsla(0,70%,60%,0.15)" />

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-red-400">
                  {ws.left.title}
                </h3>

                <div className="space-y-7 md:space-y-8">
                  {ws.left.items.map((item: any, i: number) => (
                    <ComparisonItem
                      key={i}
                      icon={<X className="w-7 h-7 text-red-400" />}
                      title={item.title}
                      description={item.description}
                      delay={i * 0.1}
                      fromX={-30}
                    />
                  ))}
                </div>

                <div className="mt-10 md:mt-12 backdrop-blur-sm bg-white/5 border border-white/10 p-6 border-l-4 border-l-red-400">
                  <p className="text-lg font-semibold mb-2">{ws.left.incentiveLabel}</p>
                  <p className="text-white/80">{ws.left.incentiveText}</p>
                </div>
              </div>
            </motion.div>

            {/* ─── RIGHT: Everence (light) ─── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[hsl(90,5%,95%)] p-10 md:p-16 relative overflow-hidden"
            >
              <FloatingParticles direction="up" color="hsla(150,50%,40%,0.12)" />

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-10 md:mb-12 text-[hsl(var(--evergreen))]">
                  {ws.right.title}
                </h3>

                <div className="space-y-7 md:space-y-8">
                  {ws.right.items.map((item: any, i: number) => (
                    <ComparisonItem
                      key={i}
                      icon={<Check className="w-7 h-7 text-green-600" />}
                      title={item.title}
                      description={item.description}
                      delay={i * 0.1}
                      fromX={30}
                    />
                  ))}
                </div>

                <div className="mt-10 md:mt-12 bg-[hsl(var(--evergreen))] text-white p-6">
                  <p className="text-lg font-semibold mb-2">{ws.right.incentiveLabel}</p>
                  <p className="text-white/90">{ws.right.incentiveText}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
