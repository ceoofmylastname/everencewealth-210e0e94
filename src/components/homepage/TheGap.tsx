import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, BarChart3, Receipt, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const gapIcons = [PiggyBank, BarChart3, Receipt];
const cardColors = ['hsl(var(--primary))', 'hsl(43 56% 57%)', 'hsl(0 70% 50%)'];

export const TheGap: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tg = t.homepage.theGap;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #F0F2F1 0%, #E8EBE9 50%, #F0F2F1 100%)' }}
    >
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-evergreen/50 mb-4">{tg.badge}</p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground leading-tight">
            {tg.headline}{' '}
            <span className="text-evergreen">{tg.headlineHighlight}</span>
          </h2>
        </motion.div>

        {/* Glassmorphic stat cards with colored top border */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {tg.gaps.map((gap, idx) => {
            const Icon = gapIcons[idx];
            return (
              <motion.div
                key={gap.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Colored top border */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: cardColors[idx] }} />
                
                {/* Gradient sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-evergreen/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-evergreen" />
                </div>
                <h3 className="text-xl font-space font-bold text-foreground mb-3">{gap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{gap.description}</p>
                <div>
                  <motion.p
                    className="text-3xl font-space font-bold text-destructive"
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                  >
                    {gap.stat}
                  </motion.p>
                  <p className="text-muted-foreground text-xs mt-1">{gap.statLabel}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bridge steps as connected timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-evergreen rounded-[60px] p-8 md:p-12 lg:p-16 text-white"
        >
          <h3 className="text-2xl md:text-3xl font-space font-bold mb-10">{tg.bridgeTitle}</h3>
          
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-5 left-[10%] right-[10%] h-px">
              <motion.div
                className="h-full bg-gradient-to-r from-white/10 via-white/30 to-white/10"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {tg.bridgeSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 relative z-10">
                  <motion.span
                    className="text-sm font-space font-bold text-white"
                    initial={{ opacity: 0.2 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-evergreen font-space font-bold text-sm rounded-xl hover:bg-white/90 transition-colors"
          >
            {tg.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
