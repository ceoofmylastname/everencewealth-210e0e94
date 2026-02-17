import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

export const PhilosophyCTA: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const c = t.philosophy.cta;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-white overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(90,5%,95%)] to-white" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[hsl(43,74%,49%)] to-transparent mx-auto mb-8" />

          <h2 className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight mb-6">
            {c.headline}
          </h2>
          <p className="text-[hsl(215,13%,40%)] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {c.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="group px-8 py-4 bg-[hsl(43,74%,49%)] text-evergreen font-space font-bold text-sm tracking-wide hover:bg-[hsl(43,74%,55%)] transition-all duration-300 hover:shadow-[0_0_24px_hsla(43,74%,49%,0.3)]"
            >
              <span className="flex items-center justify-center gap-2">
                {c.primaryCta}
                <ArrowRight className="w-4 h-4 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </button>
            <a
              href="tel:+14155550100"
              className="group px-8 py-4 border border-evergreen/20 text-evergreen font-space font-bold text-sm tracking-wide hover:border-evergreen/40 hover:bg-evergreen/[0.04] transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                {c.secondaryCta}
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
