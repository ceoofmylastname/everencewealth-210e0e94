import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart, Shield, Banknote } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const livingBenefitIcons = [Heart, Shield, Lock, Banknote];

export function WealthPhilosophy() {
  const { t } = useTranslation();
  const wp = t.homepage.wealthPhilosophy;

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-dark-bg text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=20)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/30 mb-4">
            {wp.badge}
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl mb-6">
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent">
              {wp.headline1}
            </span>
            <br />
            {wp.headline2}
          </h2>
          <p className="text-white/50 max-w-2xl text-lg">
            {wp.paragraph}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-[40px] p-8 md:p-10"
          >
            <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-red-400/80 mb-4 block">
              {wp.goldenCage}
            </span>
            <h3 className="text-2xl font-space font-bold text-white mb-4">
              {wp.goldenCageTitle}
            </h3>
            <ul className="space-y-3 text-white/50 text-sm">
              {wp.goldenCageItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card rounded-[40px] p-8 md:p-10 ring-1 ring-primary/30"
          >
            <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-primary mb-4 block">
              {wp.cashFlow}
            </span>
            <h3 className="text-2xl font-space font-bold text-white mb-4">
              {wp.cashFlowTitle}
            </h3>
            <ul className="space-y-3 text-white/50 text-sm">
              {wp.cashFlowItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold leading-tight mb-4">
            {wp.greatestAsset} <span className="text-primary">{wp.greatestAssetHighlight}</span>
          </h2>
          <p className="text-white/50 max-w-2xl text-lg mb-8">
            {wp.hlvParagraph}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white text-foreground rounded-[40px] p-8 md:p-10 max-w-lg mb-16"
        >
          <h3 className="text-xl font-space font-bold text-evergreen mb-6">{wp.incomeValuation}</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">{wp.annualIncome}</span>
              <span className="font-space font-bold text-evergreen">$150,000</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">{wp.yearsToRetirement}</span>
              <span className="font-space font-bold text-evergreen">30</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-space font-bold text-foreground">{wp.humanLifeValue}</span>
              <span className="text-2xl font-space font-bold text-evergreen">$4,500,000</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-space font-bold text-white mb-6">{wp.livingBenefitsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wp.livingBenefits.map((benefit, idx) => {
              const Icon = livingBenefitIcons[idx];
              return (
                <div key={benefit.label} className="glass-card rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-space font-bold text-white text-sm mb-1">{benefit.label}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
