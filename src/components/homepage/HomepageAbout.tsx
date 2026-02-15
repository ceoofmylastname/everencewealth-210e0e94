import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Building2, Users, MapPin } from 'lucide-react';

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

const facts = [
  { icon: Calendar, value: 'Since 1998', label: 'Founded' },
  { icon: Users, value: '75+', label: 'Carrier Partnerships' },
  { icon: Building2, value: 'Fiduciary', label: 'Independent Advisor' },
  { icon: MapPin, value: 'San Francisco, CA', label: 'Headquarters' },
];

export function HomepageAbout() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#F0F2F1] py-20 md:py-28 px-4 md:px-8">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {/* Left — Story */}
        <motion.div variants={leftVariants}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1A4D3E] mb-6">
            Everence Wealth: Built on Independence
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Founded in San Francisco in 1998, Everence Wealth was built on a simple belief: families deserve independent, fiduciary guidance—not sales pitches disguised as advice.
          </p>
          <p className="text-slate-700 leading-relaxed mb-8">
            As an independent broker with access to 75+ carriers, we work for you, not for any insurance company or investment firm. Our mission is to help you bridge the retirement gap through tax-efficient strategies that Wall Street doesn't want you to know about.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {facts.map((f) => (
              <div key={f.label} className="border-l-2 border-[#1A4D3E] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <f.icon className="w-4 h-4 text-[#1A4D3E]" />
                  <span className="font-bold text-[#1A4D3E]">{f.value}</span>
                </div>
                <span className="text-sm text-slate-500">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Visual placeholder + testimonial */}
        <motion.div variants={rightVariants} className="relative">
          <div className="rounded-2xl bg-gradient-to-br from-[#1A4D3E]/10 to-[#1A4D3E]/5 aspect-[4/3] flex items-center justify-center">
            <Building2 className="w-16 h-16 text-[#1A4D3E]/20" />
          </div>

          {/* Testimonial overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-lg">
            <p className="italic font-serif text-slate-700 text-sm leading-relaxed mb-2">
              "For the first time, I felt like my advisor was truly on my side—not selling me something."
            </p>
            <span className="text-xs text-slate-500">— Sarah M., Client since 2019</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
