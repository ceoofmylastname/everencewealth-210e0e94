import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { TrendingDown, Activity, Receipt, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

// ─── 3D Tilt Card ───────────────────────────────────────────────────────────
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  index: number;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', glowColor = 'hsla(160,48%,30%,0.4)', index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(nx);
    y.set(ny);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 800, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow orb behind card */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        animate={isHovered ? { opacity: 1, scale: 1.05 } : { opacity: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ background: glowColor, filter: 'blur(32px)', transform: 'translateZ(-20px)' }}
      />
      {children}
    </motion.div>
  );
};

// ─── Animated Counter ────────────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: string }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {value}
    </motion.span>
  );
};

// ─── Data for icons / glow colors ───────────────────────────────────────────
const CARD_META = [
  { Icon: TrendingDown, glow: 'hsla(51,78%,65%,0.25)', accent: 'hsla(51,78%,65%,1)' },
  { Icon: Activity,    glow: 'hsla(160,48%,35%,0.35)', accent: 'hsla(160,60%,55%,1)' },
  { Icon: Receipt,     glow: 'hsla(51,78%,65%,0.2)',  accent: 'hsla(51,78%,65%,1)' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export const SilentKillers: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const s = t.homepage.silentKillers;

  return (
    <section className="relative py-24 md:py-36 px-4 md:px-8 bg-evergreen text-white overflow-hidden">

      {/* ── Deep background mesh ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsla(160,48%,25%,0.6),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,hsla(51,78%,40%,0.07),transparent)]" />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(hsla(160,48%,70%,1) 1px, transparent 1px),
            linear-gradient(90deg, hsla(160,48%,70%,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Large ghost orbs ── */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(51,78%,55%,0.06) 0%, transparent 70%)', top: '-20%', right: '-10%' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsla(160,48%,40%,0.1) 0%, transparent 70%)', bottom: '0%', left: '-5%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-20"
        >
          {/* Eyebrow + line */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-[1.5px] bg-primary" />
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-primary/70" />
              <p className="text-[10px] font-space font-bold tracking-[0.35em] uppercase text-primary/70">
                {s.badge}
              </p>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-space font-black leading-none tracking-tight">
            <motion.span
              className="block"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {s.headline}
            </motion.span>
            <motion.span
              className="block text-outline-gold"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {s.headlineHighlight}
            </motion.span>
          </h2>
        </motion.div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {s.killers.map((killer, idx) => {
            const { Icon, glow, accent } = CARD_META[idx];
            return (
              <TiltCard key={killer.id} index={idx} glowColor={glow}>
                <div
                  className="relative h-full bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 md:p-9 overflow-hidden group cursor-default"
                  style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                >
                  {/* Top shimmer line */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Bottom gold accent line on hover */}
                  <motion.div
                    className="absolute bottom-0 inset-x-0 h-[1.5px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileHover={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Ghost number */}
                  <span
                    className="absolute top-5 right-7 text-[90px] font-space font-black leading-none select-none pointer-events-none transition-all duration-500"
                    style={{ color: `${accent}08` }}
                  >
                    <AnimatedNumber value={killer.id} />
                  </span>

                  {/* Floating 3D icon */}
                  <div className="relative mb-7" style={{ transformStyle: 'preserve-3d' }}>
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                      style={{
                        background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                        border: `1px solid ${accent}25`,
                        transform: 'translateZ(20px)',
                      }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + idx, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                    >
                      <Icon className="w-6 h-6" style={{ color: accent }} />
                      {/* Icon inner glow */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `radial-gradient(circle at center, ${accent}30, transparent 70%)` }}
                      />
                    </motion.div>

                    {/* Icon shadow reflection */}
                    <div
                      className="absolute -bottom-2 left-2 w-10 h-4 rounded-full blur-lg opacity-30"
                      style={{ background: accent }}
                    />
                  </div>

                  <h3 className="text-xl font-space font-bold text-white mb-3 tracking-tight">
                    {killer.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">
                    {killer.description}
                  </p>

                  {/* Corner accent dot */}
                  <div
                    className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: accent }}
                  />
                </div>
              </TiltCard>
            );
          })}
        </div>

        {/* ── Bottom CTA strip ── */}
        <motion.div
          className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/[0.06] pt-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Watermark text */}
          <p
            className="text-[clamp(2.5rem,7vw,5rem)] font-space font-black uppercase tracking-tight leading-none select-none"
            style={{ WebkitTextStroke: '1px hsla(51,78%,65%,0.08)', color: 'transparent' }}
          >
            {s.watermark}
          </p>

          {/* Gold CTA button */}
          <motion.button
            onClick={() => navigate('/contact')}
            className="group/btn relative px-8 py-4 rounded-xl font-space font-bold text-sm tracking-[0.08em] uppercase text-evergreen overflow-hidden flex-shrink-0"
            style={{ background: 'hsla(51,78%,65%,1)' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {/* Shimmer sweep */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['200% 0', '-100% 0'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
            />
            {/* Outer glow */}
            <motion.span
              className="absolute -inset-1 rounded-xl pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-400"
              style={{ background: 'hsla(51,78%,65%,0.35)', filter: 'blur(16px)' }}
            />
            <span className="relative flex items-center gap-2.5">
              {s.cta}
              <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default SilentKillers;
