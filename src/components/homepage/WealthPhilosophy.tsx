import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart, Shield, Banknote } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const livingBenefitIcons = [Heart, Shield, Lock, Banknote];

function TiltCard({ children, className, glowColor }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x: y, y: x });
  }, []);

  return (
    <div
      className="relative"
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovering(false); }}
      style={{ perspective: '1000px' }}
    >
      {glowColor && hovering && (
        <div className="absolute -inset-4 rounded-[48px] blur-2xl transition-opacity duration-300 pointer-events-none"
          style={{ background: glowColor, opacity: 0.15 }}
        />
      )}
      <div
        className={className}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function WealthPhilosophy() {
  const { t } = useTranslation();
  const wp = t.homepage.wealthPhilosophy;
  const images = useHomepageImages();

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-dark-bg text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{ backgroundImage: `url(${images.philosophy || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=20'})` }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-primary/60 mb-4">{wp.badge}</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold leading-tight max-w-3xl mb-6">
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent">
              {wp.headline1}
            </span>
            <br />{wp.headline2}
          </h2>
          <p className="text-primary/70 max-w-2xl text-lg">{wp.paragraph}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard glowColor="hsl(0 70% 50%)" className="glass-card rounded-[40px] p-8 md:p-10">
              <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-red-400/80 mb-4 block">{wp.goldenCage}</span>
              <h3 className="text-2xl font-space font-bold text-white mb-4">{wp.goldenCageTitle}</h3>
                <ul className="space-y-3 text-primary/60 text-sm">
                {wp.goldenCageItems.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </TiltCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard glowColor="hsl(var(--primary))" className="glass-card rounded-[40px] p-8 md:p-10 ring-1 ring-primary/30">
              <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-primary mb-4 block">{wp.cashFlow}</span>
              <h3 className="text-2xl font-space font-bold text-white mb-4">{wp.cashFlowTitle}</h3>
              <ul className="space-y-3 text-primary/60 text-sm">
                {wp.cashFlowItems.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </TiltCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-space font-bold leading-tight mb-4">
            {wp.greatestAsset} <span className="text-primary">{wp.greatestAssetHighlight}</span>
          </h2>
          <p className="text-primary/70 max-w-2xl text-lg mb-8">{wp.hlvParagraph}</p>
        </motion.div>

        {/* Income valuation table with row-by-row animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white text-foreground rounded-[40px] p-8 md:p-10 max-w-lg mb-16"
        >
          <h3 className="text-xl font-space font-bold text-evergreen mb-6">{wp.incomeValuation}</h3>
          <div className="space-y-4 text-sm">
            {[
              { label: wp.annualIncome, value: '$150,000' },
              { label: wp.yearsToRetirement, value: '30' },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex justify-between border-b border-border pb-3"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-space font-bold text-evergreen">{row.value}</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex justify-between pt-2"
            >
              <span className="font-space font-bold text-foreground">{wp.humanLifeValue}</span>
              <span className="text-2xl font-space font-bold text-evergreen">$4,500,000</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Living benefits with icon spin + hover float */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-xl font-space font-bold text-white mb-6">{wp.livingBenefitsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wp.livingBenefits.map((benefit, idx) => {
              const Icon = livingBenefitIcons[idx];
              return (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-card rounded-2xl p-6 group"
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4"
                    whileInView={{ rotate: 360 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <h4 className="font-space font-bold text-white text-sm mb-1">{benefit.label}</h4>
                  <p className="text-primary/60 text-xs leading-relaxed">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
