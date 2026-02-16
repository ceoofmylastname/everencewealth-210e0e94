import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

export const CTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const c = t.homepage.cta;
  const images = useHomepageImages();

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
      {images.cta && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: `url(${images.cta})` }}
        />
      )}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <ScrollReveal>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            {c.headline}
          </h2>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {c.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <button
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              {c.primaryCta}
            </button>
            <a
              href="tel:+14155551234"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-all"
            >
              <Phone className="w-5 h-5" />
              {c.secondaryCta}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
