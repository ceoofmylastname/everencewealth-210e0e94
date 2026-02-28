import React from 'react';
import { ShieldCheck, Star, Sparkles, Globe } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import { COMPANY_FACTS } from '@/constants/company';
import { motion } from 'framer-motion';
import { ScrollReveal, staggerContainer, staggerItem } from '@/components/homepage/ScrollReveal';

const benefits = [
  {
    icon: ShieldCheck,
    titleKey: 'apiAccredited',
    descKey: 'apiAccreditedDesc',
    fallbackTitle: 'Client-First Standard',
    fallbackDesc: 'We work exclusively for you — not for any insurance company, bank, or Wall Street institution.',
  },
  {
    icon: Star,
    titleKey: 'experience',
    descKey: 'experienceDesc',
    fallbackTitle: `${COMPANY_FACTS.yearsExperience}+ Years Experience`,
    fallbackDesc: 'Our team has helped hundreds of families build tax-efficient retirement strategies.',
  },
  {
    icon: Sparkles,
    titleKey: 'aiTools',
    descKey: 'aiToolsDesc',
    fallbackTitle: 'AI-Enhanced Analysis',
    fallbackDesc: 'Advanced AI tools to optimize your wealth strategy and retirement projections.',
  },
  {
    icon: Globe,
    titleKey: 'multilingual',
    descKey: 'multilingualDesc',
    fallbackTitle: 'English & Spanish',
    fallbackDesc: 'Full guidance in English and Spanish for all your wealth planning needs.',
  },
];

export const WhyChooseUs: React.FC = () => {
  const { t } = useTranslation();
  const whyChooseUs = (t as any).whyChooseUs || {};

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block text-prime-gold text-sm font-semibold tracking-wider uppercase mb-3">
              {whyChooseUs.eyebrow || 'Why Choose Us'}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {whyChooseUs.headline || 'Why Everence Wealth?'}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const title = whyChooseUs.benefits?.[benefit.titleKey] || benefit.fallbackTitle;
            const desc = whyChooseUs.benefitsDesc?.[benefit.descKey] || benefit.fallbackDesc;
            
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="group text-center p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-prime-gold/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-prime-gold/10 text-prime-gold mb-5 group-hover:bg-prime-gold group-hover:text-prime-900 transition-all duration-300">
                  <Icon size={28} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
