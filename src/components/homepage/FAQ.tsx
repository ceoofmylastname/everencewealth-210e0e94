import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, staggerContainer, staggerItem } from './ScrollReveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What does it mean to be a fiduciary?',
    a: 'A fiduciary is legally obligated to act in your best interest — not earn commissions or push proprietary products. Unlike most brokers, we sit on your side of the table.',
  },
  {
    q: 'What is Indexed Universal Life (IUL) insurance?',
    a: 'IUL is a permanent life insurance product that offers a death benefit plus cash value growth linked to market indexes — with a floor that protects you from losses. It can serve as a tax-advantaged retirement supplement.',
  },
  {
    q: 'How are your fees structured?',
    a: 'We are compensated by the insurance carriers we work with — you pay nothing out of pocket for our advisory services. We disclose all compensation transparently.',
  },
  {
    q: 'How does tax-free retirement income work?',
    a: 'Certain financial instruments, like Roth IRAs and properly structured IUL policies, allow you to withdraw funds tax-free in retirement. We help you build a multi-bucket strategy to minimize lifetime taxes.',
  },
  {
    q: 'Who is Everence Wealth best suited for?',
    a: 'We primarily serve families and professionals between ages 35-60 who want to protect their wealth, optimize their tax situation, and build a reliable retirement income they won\'t outlive.',
  },
  {
    q: 'How is Everence Wealth different from a traditional financial advisor?',
    a: 'We combine fiduciary duty with access to 75+ insurance carriers, tax-optimized strategies, and institutional-grade planning — without the conflicts of interest common in the brokerage world.',
  },
  {
    q: 'What is the retirement gap assessment?',
    a: 'It\'s a complimentary analysis that compares your current trajectory against what you\'ll actually need in retirement. In five minutes, you\'ll see exactly where you stand and what adjustments could close the gap.',
  },
];

export const FAQ: React.FC = () => (
  <section className="relative py-24 md:py-32 bg-[hsl(160_80%_2%)]">
    <div className="container mx-auto px-6 max-w-3xl">
      <ScrollReveal>
        <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 text-center">FAQ</p>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-16 text-center">
          Common Questions
        </h2>
      </ScrollReveal>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
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
