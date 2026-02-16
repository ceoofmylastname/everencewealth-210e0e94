import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart, Shield, Banknote } from 'lucide-react';

const livingBenefits = [
  { icon: Heart, label: 'Chronic Illness', desc: 'Access benefits if diagnosed with qualifying chronic condition' },
  { icon: Shield, label: 'Critical Illness', desc: 'Lump sum or accelerated benefit for heart attack, stroke, cancer' },
  { icon: Lock, label: 'Terminal Illness', desc: 'Accelerate death benefit while still living' },
  { icon: Banknote, label: 'Long-Term Care', desc: 'Fund care needs without separate LTC policy' },
];

export function WealthPhilosophy() {
  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-dark-bg text-white overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=20)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Cash Flow Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-white/30 mb-4">
            Wealth Philosophy
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl mb-6">
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent">
              Net Worth Is Vanity.
            </span>
            <br />
            Cash Flow Is Sanity.
          </h2>
          <p className="text-white/50 max-w-2xl text-lg">
            Traditional retirement planning obsesses over accumulation. We focus on what actually matters:
            tax-free, predictable income that you can never outlive.
          </p>
        </motion.div>

        {/* Two comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-[40px] p-8 md:p-10"
          >
            <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-red-400/80 mb-4 block">
              The Golden Cage
            </span>
            <h3 className="text-2xl font-space font-bold text-white mb-4">
              $2M saved, $50K/yr income
            </h3>
            <ul className="space-y-3 text-white/50 text-sm">
              <li>• Constant market anxiety</li>
              <li>• RMDs forcing taxable withdrawals</li>
              <li>• 4% rule → money runs out at 87</li>
              <li>• One market crash can destroy decades</li>
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
              Cash Flow Mobility
            </span>
            <h3 className="text-2xl font-space font-bold text-white mb-4">
              $800K funded, $80K/yr tax-free
            </h3>
            <ul className="space-y-3 text-white/50 text-sm">
              <li>• Zero market risk on principal</li>
              <li>• No RMDs, no forced distributions</li>
              <li>• Income for life — guaranteed</li>
              <li>• Living benefits built in</li>
            </ul>
          </motion.div>
        </div>

        {/* Human Life Value */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold leading-tight mb-4">
            You Are Your <span className="text-primary">Greatest Asset</span>
          </h2>
          <p className="text-white/50 max-w-2xl text-lg mb-8">
            A 35-year-old earning $150K/year has a Human Life Value of $4.5M+.
            Insurance isn't an expense — it's how you capitalize your most valuable asset.
          </p>
        </motion.div>

        {/* Income valuation card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white text-foreground rounded-[40px] p-8 md:p-10 max-w-lg mb-16"
        >
          <h3 className="text-xl font-space font-bold text-evergreen mb-6">Income Valuation</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Annual Income</span>
              <span className="font-space font-bold text-evergreen">$150,000</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Years to Retirement</span>
              <span className="font-space font-bold text-evergreen">30</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-space font-bold text-foreground">Human Life Value</span>
              <span className="text-2xl font-space font-bold text-evergreen">$4,500,000</span>
            </div>
          </div>
        </motion.div>

        {/* Living Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-space font-bold text-white mb-6">Living Benefits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {livingBenefits.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-space font-bold text-white text-sm mb-1">{label}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
