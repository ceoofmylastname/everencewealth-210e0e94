import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, BarChart3, FileCheck } from 'lucide-react';
import { ScrollReveal, staggerContainer, staggerItem } from './ScrollReveal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const stepIcons = [ClipboardList, BarChart3, FileCheck];

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const a = t.homepage.assessment;
  const images = useHomepageImages();

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
      {images.assessment && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
          style={{ backgroundImage: `url(${images.assessment})` }}
        />
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <ScrollReveal>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">{a.badge}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">{a.headline}</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-16">
            {a.subtitle}
          </p>
        </ScrollReveal>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {a.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.div key={step.title} variants={staggerItem} className="glass-card rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Step {i + 1}</p>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <ScrollReveal delay={0.3}>
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            {a.cta}
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
};
