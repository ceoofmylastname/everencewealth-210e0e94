import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, staggerContainer, staggerItem } from './ScrollReveal';
import { useTranslation } from '@/i18n/useTranslation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const fq = t.homepage.faq;

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)]">
      <div className="container mx-auto px-6 max-w-3xl">
        <ScrollReveal>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 text-center">{fq.badge}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16 text-center">
            {fq.headline}
          </h2>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {fq.items.map((faq, i) => (
              <motion.div key={i} variants={staggerItem}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="glass-card rounded-xl border-white/10 px-6"
                >
                  <AccordionTrigger className="text-white text-left text-lg font-medium hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 text-base leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
