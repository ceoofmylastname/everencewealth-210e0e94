import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, BarChart3, FileCheck } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const stepIcons = [ClipboardList, BarChart3, FileCheck];

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const a = t.homepage.assessment;
  const images = useHomepageImages();
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 600);
    navigate('/assessment');
  }, [navigate]);

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
      {images.assessment && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
          style={{ backgroundImage: `url(${images.assessment})` }}
        />
      )}
      
      {/* Slowly rotating radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
          animation: 'spin 30s linear infinite',
        }}
      />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <ScrollReveal>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">{a.badge}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{a.headline}</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-16">{a.subtitle}</p>
        </ScrollReveal>

        {/* Connected step timeline */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {a.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/30 flex items-center justify-center">
                    <span className="text-2xl font-space font-bold text-primary">{i + 1}</span>
                  </div>

                  <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center group hover:-translate-y-1 transition-transform duration-300">
                    {/* Inner top glow */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
                    
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <ScrollReveal delay={0.3}>
          <button
            ref={btnRef}
            onClick={handleClick}
            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all overflow-hidden"
            style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.15)' }}
          >
            {/* Pulsing glow ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary" style={{ animationDuration: '2s' }} />
            
            {/* Ripple */}
            {ripple && (
              <span
                className="absolute rounded-full bg-white/30 animate-scale-in"
                style={{
                  left: ripple.x - 20,
                  top: ripple.y - 20,
                  width: 40,
                  height: 40,
                  animation: 'ripple 0.6s ease-out forwards',
                }}
              />
            )}
            <span className="relative z-10">{a.cta}</span>
          </button>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes ripple {
          to { transform: scale(10); opacity: 0; }
        }
      `}</style>
    </section>
  );
};
