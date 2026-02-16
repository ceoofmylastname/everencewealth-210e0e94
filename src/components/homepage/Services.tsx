import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Shield, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const serviceIcons = [PiggyBank, Shield, Users];
const serviceLinks = ['/strategies/tax-free-retirement', '/strategies/asset-protection', '/strategies/whole-life'];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sv = t.homepage.services;
  const images = useHomepageImages();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-evergreen/50 mb-4">
            {sv.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground">
            {sv.headline}
          </h2>
        </motion.div>

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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {sv.items.map((service, idx) => {
            const Icon = serviceIcons[idx];
            const link = serviceLinks[idx];
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                className="group border border-border rounded-[30px] p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:bg-evergreen transition-colors duration-300">
                  <Icon className="w-6 h-6 text-evergreen group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-space font-bold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-evergreen shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(link)}
                  className="inline-flex items-center gap-1.5 text-sm font-space font-semibold text-evergreen hover:gap-3 transition-all duration-300"
                >
                  {sv.learnMore} <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
