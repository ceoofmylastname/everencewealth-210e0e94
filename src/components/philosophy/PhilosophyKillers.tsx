import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Activity, Receipt } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useTranslation } from '@/i18n/useTranslation';

const icons = [TrendingDown, Activity, Receipt];

// Mini chart data for each killer
const feeData = Array.from({ length: 12 }, (_, i) => ({
  year: i,
  withFees: 100000 * Math.pow(1.04, i),
  withoutFees: 100000 * Math.pow(1.07, i),
}));

const volatilityData = [
  { year: 'Y1', value: 100 }, { year: 'Y2', value: 78 }, { year: 'Y3', value: 92 },
  { year: 'Y4', value: 65 }, { year: 'Y5', value: 88 }, { year: 'Y6', value: 72 },
  { year: 'Y7', value: 95 }, { year: 'Y8', value: 60 }, { year: 'Y9', value: 85 },
];

const taxData = [
  { label: 'Earned', rate: 37 }, { label: 'Capital', rate: 23.8 },
  { label: 'RMD', rate: 37 }, { label: 'Tax-Free', rate: 0 },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export const PhilosophyKillers: React.FC = () => {
  const { t } = useTranslation();
  const k = t.philosophy.killers;

  const charts = [
    // Fees chart
    <ResponsiveContainer width="100%" height={120} key="fees">
      <AreaChart data={feeData}>
        <Area type="monotone" dataKey="withoutFees" stroke="hsla(160,48%,30%,0.6)" fill="hsla(160,48%,30%,0.1)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="withFees" stroke="hsla(0,60%,50%,0.6)" fill="hsla(0,60%,50%,0.08)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
      </AreaChart>
    </ResponsiveContainer>,
    // Volatility chart
    <ResponsiveContainer width="100%" height={120} key="volatility">
      <AreaChart data={volatilityData}>
        <Area type="monotone" dataKey="value" stroke="hsla(43,74%,49%,0.7)" fill="hsla(43,74%,49%,0.1)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>,
    // Tax chart
    <ResponsiveContainer width="100%" height={120} key="taxes">
      <BarChart data={taxData}>
        <Bar dataKey="rate" radius={[2, 2, 0, 0]}>
          {taxData.map((entry, idx) => (
            <Cell
              key={idx}
              fill={idx === 3 ? 'hsla(160,48%,30%,0.7)' : 'hsla(0,0%,50%,0.3)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>,
  ];

  return (
    <section id="philosophy-killers" className="py-20 md:py-28 px-4 md:px-8 bg-[hsl(90,5%,95%)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="w-16 h-[2px] bg-gradient-to-r from-[hsl(43,74%,49%)] to-transparent mb-6" />
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-[hsl(215,13%,40%)]/60 mb-4">
            {k.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight max-w-3xl">
            {k.headline}
          </h2>
          <p className="text-[hsl(215,13%,40%)] mt-4 max-w-2xl leading-relaxed">
            {k.subheadline}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {k.cards.map((card: { id: string; title: string; description: string; stat: string; statLabel: string }, idx: number) => {
            const Icon = icons[idx];
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                className="group relative bg-white border border-black/[0.06] p-8 md:p-10 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300"
              >
                {/* Top accent line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-evergreen/20 via-evergreen/40 to-transparent" />

                <span className="absolute top-4 right-6 text-[72px] font-space font-bold text-black/[0.03] leading-none select-none">
                  {card.id}
                </span>

                <div className="w-12 h-12 bg-evergreen/[0.08] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-evergreen" />
                </div>

                <h3 className="text-xl font-space font-bold text-evergreen mb-3">{card.title}</h3>
                <p className="text-[hsl(215,13%,40%)] text-sm leading-relaxed mb-6">{card.description}</p>

                {/* Mini chart */}
                <div className="mb-4">{charts[idx]}</div>

                {/* Stat callout */}
                <div className="border-t border-black/[0.06] pt-4">
                  <span className="text-2xl font-space font-bold text-evergreen">{card.stat}</span>
                  <span className="text-xs text-[hsl(215,13%,40%)]/60 ml-2">{card.statLabel}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
