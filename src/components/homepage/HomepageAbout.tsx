import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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

function FactCounter({ value }: { value: string }) {
  // If value starts with letters (e.g. "Founded", "Fiduciary"), don't animate — show as-is
  const startsWithText = /^[a-zA-Z]/.test(value.trim());
  const num = startsWithText ? NaN : parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = startsWithText ? '' : value.replace(/[0-9,]/g, '');
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isNaN(num)) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const duration = 1500;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * num));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [num]);

  if (isNaN(num)) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function HomepageAbout() {
  const sectionRef = React.useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const { t } = useTranslation();
  const ha = t.homepage.homepageAbout;
  const images = useHomepageImages();

  // Parallax for decorative shape
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const shapeY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative bg-[#F0F2F1] py-20 md:py-28 px-4 md:px-8 overflow-hidden">
      {/* Subtle warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F2F1] via-[#F5F0EB] to-[#F0F2F1] pointer-events-none" />
      {/* Micro-dot pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(160 48% 30% / 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Soft glow accents */}
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(43 56% 57% / 0.04) 0%, transparent 70%)' }} />

      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        <motion.div variants={leftVariants}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A4D3E] mb-6">
            {ha.headline}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">{ha.paragraph1}</p>
          <p className="text-slate-700 leading-relaxed mb-8">{ha.paragraph2}</p>

          <div className="grid grid-cols-2 gap-6">
            {ha.facts.map((f, idx) => {
              const Icon = factIcons[idx];
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="border-l-2 border-[#1A4D3E] pl-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#1A4D3E]" />
                    <span className="font-bold text-[#1A4D3E]">
                      <FactCounter value={f.value} />
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">{f.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={rightVariants} className="relative">
          {/* Decorative parallax shape */}
          <motion.div
            style={{ y: shapeY }}
            className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-[#1A4D3E]/[0.06] pointer-events-none"
          />

          {images.about ? (
            <img
              src={images.about}
              alt="Professional financial advisor meeting with clients"
              className="rounded-2xl aspect-[4/3] object-cover w-full"
              loading="lazy"
              style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }}
            />
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-[#1A4D3E]/10 to-[#1A4D3E]/5 aspect-[4/3] flex items-center justify-center">
              <Building2 className="w-16 h-16 text-[#1A4D3E]/20" />
            </div>
          )}

          {/* Enhanced glassmorphic testimonial */}
          <div className="absolute bottom-4 left-4 right-4 bg-[#1A4D3E]/85 backdrop-blur-xl rounded-xl p-5 shadow-lg border border-white/10">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[hsl(43_56%_57%/0.4)] to-transparent" />
            <p className="italic font-serif text-white/90 text-sm leading-relaxed mb-2">
              "{ha.testimonial}"
            </p>
            <span className="text-xs text-[hsl(43_56%_57%/0.7)]">{ha.testimonialAuthor}</span>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.05) translate(-1%, -1%); }
        }
      `}</style>
    </section>
  );
}
