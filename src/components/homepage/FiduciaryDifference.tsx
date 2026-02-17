import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Network, Award, Users, Scale } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const cardIcons = [Building2, ShieldCheck, Network];
const badgeIcons = [Award, Users, Scale];

function GlowCard({ children, index }: { children: React.ReactNode; index: number }) {
  const [hovering, setHovering] = useState(false);
  const watermark = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Emerald glow on hover */}
      {hovering && (
        <div className="absolute -inset-3 rounded-[32px] bg-primary/10 blur-2xl transition-opacity pointer-events-none" />
      )}
      
      <div className={`relative bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-transform duration-300 ${hovering ? '-translate-y-1' : ''}`}>
        {/* Inner top glow line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Watermark number */}
        <span className="absolute top-4 right-6 text-7xl font-space font-bold text-white/[0.03] select-none pointer-events-none">
          {watermark}
        </span>
        
        {children}
      </div>
    </motion.div>
  );
}

export function FiduciaryDifference() {
  const { t } = useTranslation();
  const fd = t.homepage.fiduciaryDifference;

  return (
    <section className="relative bg-[#1A4D3E] py-20 md:py-28 overflow-hidden">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/10 pointer-events-none"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl font-serif font-bold text-white text-center mb-4"
        >
          {fd.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-primary/80 text-lg md:text-xl text-center mb-14 max-w-2xl mx-auto"
        >
          {fd.subtitle}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {fd.cards.map((card, idx) => {
            const Icon = cardIcons[idx];
            return (
              <GlowCard key={card.title} index={idx}>
                <Icon className="w-10 h-10 text-white mb-5" />
                <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                <ul className="space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-primary/80 text-sm leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            );
          })}
        </div>

        {/* Badge row with sequential pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {fd.badges.map((badge, idx) => {
            const Icon = badgeIcons[idx];
            return (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: [0.8, 1.1, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.15 }}
                className="flex items-center gap-2 text-primary/70 text-sm"
              >
                <Icon className="w-4 h-4" />
                {badge}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
