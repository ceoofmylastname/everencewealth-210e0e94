import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const testimonials = [
  {
    quote: "Michael helped us uncover $80K in hidden 401k fees we didn't know existed. We moved to an indexed strategy and now have tax-free access to our cash value. Game changer.",
    name: 'Sarah & Tom K.',
    location: 'San Francisco',
    initials: 'ST',
  },
  {
    quote: "I never understood how much I was losing to taxes until Everence showed me the three-bucket strategy. Now my retirement income is structured to minimize my tax burden every single year.",
    name: 'David R.',
    location: 'Los Angeles',
    initials: 'DR',
  },
  {
    quote: "As a small business owner, I needed someone who understood both my personal and business finances. Everence built a plan that protects my family and my company — without the conflicts of a big bank.",
    name: 'Jennifer L.',
    location: 'San Diego',
    initials: 'JL',
  },
  {
    quote: "The indexed strategy they recommended has given us peace of mind we never had with our old portfolio. Zero market losses, steady growth, and tax-free distributions — exactly what we needed heading into retirement.",
    name: 'Robert & Maria S.',
    location: 'Sacramento',
    initials: 'RS',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-white py-20 md:py-28" ref={ref}>
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A4D3E] text-center mb-14">
          What Our Clients Say
        </h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((t, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 px-4">
                <div className="max-w-2xl mx-auto text-center">
                  {/* Decorative quote */}
                  <span className="block font-serif text-6xl leading-none text-[#1A4D3E]/20 mb-4 select-none">"</span>

                  <p className="font-serif italic text-slate-700 text-lg md:text-xl leading-relaxed mb-6">
                    {t.quote}
                  </p>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Avatar & attribution */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A4D3E] text-white flex items-center justify-center text-sm font-semibold">
                      {t.initials}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === selectedIndex ? 'bg-[#1A4D3E]' : 'bg-slate-300'
              }`}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
