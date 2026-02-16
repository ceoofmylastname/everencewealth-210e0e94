import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Building2, Users, MapPin } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { useHomepageImages } from '@/hooks/useHomepageImages';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const leftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const rightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const factIcons = [Calendar, Users, Building2, MapPin];

export function HomepageAbout() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { t } = useTranslation();
  const ha = t.homepage.homepageAbout;
  const images = useHomepageImages();

  return (
    <section ref={ref} className="bg-[#F0F2F1] py-20 md:py-28 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <motion.div variants={leftVariants}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A4D3E] mb-6">
            {ha.headline}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            {ha.paragraph1}
          </p>
          <p className="text-slate-700 leading-relaxed mb-8">
            {ha.paragraph2}
          </p>

          <div className="grid grid-cols-2 gap-6">
            {ha.facts.map((f, idx) => {
              const Icon = factIcons[idx];
              return (
                <div key={f.label} className="border-l-2 border-[#1A4D3E] pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#1A4D3E]" />
                    <span className="font-bold text-[#1A4D3E]">{f.value}</span>
                  </div>
                  <span className="text-sm text-slate-500">{f.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={rightVariants} className="relative">
          {images.about ? (
            <img
              src={images.about}
              alt="Professional financial advisor meeting with clients"
              className="rounded-2xl aspect-[4/3] object-cover w-full"
              loading="lazy"
            />
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-[#1A4D3E]/10 to-[#1A4D3E]/5 aspect-[4/3] flex items-center justify-center">
              <Building2 className="w-16 h-16 text-[#1A4D3E]/20" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg">
            <p className="italic font-serif text-slate-700 text-sm leading-relaxed mb-2">
              "{ha.testimonial}"
            </p>
            <span className="text-xs text-slate-500">{ha.testimonialAuthor}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
