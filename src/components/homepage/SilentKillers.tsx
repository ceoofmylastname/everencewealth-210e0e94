import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Receipt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const icons = [TrendingDown, Activity, Receipt];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const particles = [
  { x: '10%', y: '20%', size: 4, color: 'hsla(160,48%,30%,0.15)', duration: 8, delay: 0 },
  { x: '85%', y: '35%', size: 3, color: 'hsla(40,45%,55%,0.12)', duration: 10, delay: 1 },
  { x: '70%', y: '75%', size: 5, color: 'hsla(160,48%,30%,0.1)', duration: 12, delay: 2 },
  { x: '25%', y: '80%', size: 3, color: 'hsla(40,45%,55%,0.1)', duration: 9, delay: 3 },
];

export const SilentKillers: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const s = t.homepage.silentKillers;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-evergreen text-white overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsla(160,48%,30%,0.2),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsla(160,48%,30%,0.1),_transparent_60%)]" />
      
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          {/* Gold accent line */}
          <div className="w-16 h-[2px] bg-gradient-to-r from-[#C5A059] to-transparent mb-6" />
          
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/40 mb-4">
            {s.badge}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl">
            {s.headline}{' '}
            <span className="text-outline relative inline-block">
              {/* Shimmer overlay */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] bg-clip-text"
                style={{ animation: 'shimmer-drift 4s linear infinite' }}
                aria-hidden="true"
              />
              {s.headlineHighlight}
            </span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {s.killers.map((killer, idx) => {
            const Icon = icons[idx];
            return (
              <motion.div
                key={killer.id}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/[0.15] transition-colors duration-300"
              >
                {/* Top inner glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Hover emerald glow */}
                <div className="absolute -inset-1 rounded-3xl bg-[hsla(160,48%,30%,0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

                <span className="absolute top-6 right-8 text-[80px] font-space font-bold text-white/[0.03] group-hover:text-white/[0.06] transition-colors duration-500 leading-none select-none">
                  {killer.id}
                </span>
                
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/10 flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.15, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + idx * 0.2 }}
                  >
                    <Icon className="w-6 h-6 text-white/80" />
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-space font-bold text-white mb-3">{killer.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{killer.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-16 text-center">
          <motion.p
            className="text-[6vw] md:text-[4vw] font-space font-bold text-white/[0.04] uppercase tracking-tight leading-none mb-8 select-none"
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          >
            {s.watermark}
          </motion.p>
          <button
            onClick={() => navigate('/contact')}
            className="group/btn relative px-8 py-4 bg-white text-evergreen font-space font-bold text-sm tracking-wide rounded-xl hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_hsla(40,45%,55%,0.3)] border border-transparent hover:border-[#C5A059]/40"
          >
            <span className="flex items-center gap-2">
              {s.cta}
              <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer-drift {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
};

export default SilentKillers;
