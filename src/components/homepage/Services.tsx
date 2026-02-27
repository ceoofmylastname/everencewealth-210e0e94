import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Shield, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const serviceIcons = [PiggyBank, Shield, Users];
const serviceLinks = ['/strategies/tax-free-retirement', '/strategies/asset-protection', '/strategies/whole-life'];

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sv = t.homepage.services;
  const images = useHomepageImages();

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-8 bg-white overflow-hidden">
      {/* Subtle micro-dot pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(160 48% 30% / 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Soft radial glow accents */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(160 48% 30% / 0.03) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(43 56% 57% / 0.025) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-evergreen/50 mb-4">{sv.badge}</p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground">{sv.headline}</h2>
        </motion.div>

        {/* Parallax image banner with glassmorphic overlay */}
        {images.services && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[30px] overflow-hidden mb-14 aspect-[16/6]"
          >
            <img
              src={images.services}
              alt="Premium wealth management office"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/20">
              <p className="text-white font-space font-bold text-lg">{sv.headline}</p>
            </div>
          </motion.div>
        )}

        {/* Dark glassmorphic service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sv.items.map((service, idx) => {
            const Icon = serviceIcons[idx];
            const link = serviceLinks[idx];
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[hsl(160_80%_2%)] text-white rounded-3xl p-8 overflow-hidden hover:-translate-y-2 transition-all duration-500"
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 40px rgba(26,77,62,0.3), 0 0 0 1px hsl(43 56% 57% / 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)')}
              >
                {/* Inner top glow */}
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Gradient sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                {/* Icon with gradient ring + pulse glow */}
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))' }}
                  whileInView={{ scale: [0.8, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                >
                  <div className="absolute inset-0 rounded-2xl border border-primary/30 group-hover:border-primary/50 transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }} />
                  <Icon className="w-7 h-7 text-primary relative z-10" />
                </motion.div>

                <h3 className="text-xl font-space font-bold text-white mb-3">{service.title}</h3>
                <p className="text-primary/60 text-sm mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-primary/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Animated underline link */}
                <button
                  onClick={() => navigate(link)}
                  className="inline-flex items-center gap-1.5 text-sm font-space font-semibold text-primary group/link"
                >
                  <span className="relative">
                    {sv.learnMore}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover/link:w-full transition-all duration-300" />
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
