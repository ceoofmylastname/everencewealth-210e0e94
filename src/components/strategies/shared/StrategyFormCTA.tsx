import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { FloatingParticles } from './FloatingParticles';

interface StrategyFormCTAProps {
  headline: string;
  subtitle: string;
  submitText: string;
  disclaimer: string;
  incomeRanges: string[];
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  incomePlaceholder: string;
}

export const StrategyFormCTA: React.FC<StrategyFormCTAProps> = ({
  headline, subtitle, submitText, disclaimer, incomeRanges,
  namePlaceholder, emailPlaceholder, phonePlaceholder, incomePlaceholder,
}) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', income: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Strategy form submitted:', form);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,21%) 0%, hsl(160,48%,8%) 100%)' }}>
      <MorphingBlob className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] opacity-15" colors={['hsl(43,74%,49%)', 'hsl(43,74%,60%)']} />
      <MorphingBlob className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] opacity-10" colors={['hsl(160,48%,30%)', 'hsl(160,48%,40%)']} />
      <FloatingParticles count={15} />

      <div className="container max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          {headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={namePlaceholder}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
              required
            />
            <input
              type="email"
              placeholder={emailPlaceholder}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
              required
            />
            <input
              type="tel"
              placeholder={phonePlaceholder}
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
            />
            <select
              value={form.income}
              onChange={e => setForm(p => ({ ...p, income: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white/70 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
            >
              <option value="" className="text-foreground">{incomePlaceholder}</option>
              {incomeRanges.map(r => (
                <option key={r} value={r} className="text-foreground">{r}</option>
              ))}
            </select>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, hsl(43,74%,49%) 0%, hsl(43,74%,55%) 100%)', color: 'hsl(160,48%,12%)' }}
            >
              <span className="relative z-10">{submitText}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </motion.button>
          </form>
          <p className="text-xs text-white/50 mt-5">{disclaimer}</p>
        </motion.div>
      </div>
    </section>
  );
};
