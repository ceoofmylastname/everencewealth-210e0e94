import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
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
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  return (
    <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)] overflow-hidden">
      {/* Decorative vertical text */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 text-white/[0.03] text-8xl font-space font-bold tracking-widest select-none pointer-events-none whitespace-nowrap">
        FAQ
      </div>

      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <ScrollReveal>
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 text-center">{fq.badge}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16 text-center">
            {fq.headline}
          </h2>
        </ScrollReveal>

        <Accordion
          type="single"
          collapsible
          className="space-y-4"
          value={openItem}
          onValueChange={setOpenItem}
        >
          {fq.items.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Emerald glow behind open item */}
              <AnimatePresence>
                {openItem === `faq-${i}` && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -inset-2 rounded-2xl bg-primary/[0.06] blur-xl pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <AccordionItem
                value={`faq-${i}`}
                className={`relative bg-white/[0.06] backdrop-blur-xl border rounded-xl px-6 transition-colors duration-300 ${
                  openItem === `faq-${i}`
                    ? 'border-primary/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <AccordionTrigger
                  className={`text-left text-lg font-medium hover:no-underline py-5 transition-colors duration-300 ${
                    openItem === `faq-${i}` ? 'text-[hsl(var(--gold,43_56%_57%))]' : 'text-white'
                  }`}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 text-base leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
