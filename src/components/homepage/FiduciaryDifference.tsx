import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Network, Award, Users, Scale } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const cardIcons = [Building2, ShieldCheck, Network];
const badgeIcons = [Award, Users, Scale];

export function FiduciaryDifference() {
  const { t } = useTranslation();
  const fd = t.homepage.fiduciaryDifference;

  return (
    <section className="bg-[#1A4D3E] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.h2
            variants={cardVariants}
            className="text-3xl md:text-5xl font-serif font-bold text-white text-center mb-4"
          >
            {fd.headline}
          </motion.h2>
          <motion.p
            variants={cardVariants}
            className="text-white/70 text-lg md:text-xl text-center mb-14 max-w-2xl mx-auto"
          >
            {fd.subtitle}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {fd.cards.map((card, idx) => {
              const Icon = cardIcons[idx];
              return (
                <motion.div
                  key={card.title}
                  variants={cardVariants}
                  className="bg-white/10 border border-white/20 rounded-2xl p-8"
                >
                  <Icon className="w-10 h-10 text-white mb-5" />
                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                  <ul className="space-y-3">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-white/80 text-sm leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={cardVariants}
            className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
          >
            {fd.badges.map((badge, idx) => {
              const Icon = badgeIcons[idx];
              return (
                <div key={badge} className="flex items-center gap-2 text-white/60 text-sm">
                  <Icon className="w-4 h-4" />
                  {badge}
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
