import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

const performanceData = [
  { year: '2006', sp500: '+16%', iul: '+11% (cap)' },
  { year: '2007', sp500: '+5%', iul: '+5%' },
  { year: '2008', sp500: '-37%', iul: '0% (floor)', highlight: true },
  { year: '2009', sp500: '+27%', iul: '+11% (cap)' },
  { year: '2018', sp500: '-6%', iul: '0% (floor)', highlight: true },
  { year: '2020', sp500: '+18%', iul: '+11% (cap)' },
  { year: '2022', sp500: '-18%', iul: '0% (floor)', highlight: true },
  { year: '2023', sp500: '+26%', iul: '+11% (cap)' },
];

const audienceIcons = [Shield, Users, Heart, Clock];

export function IndexedAdvantage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ia = t.homepage.indexedAdvantage;

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
          <p className="text-xs font-space font-bold tracking-[0.3em] uppercase text-evergreen/60 mb-4">
            {ia.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-evergreen leading-tight max-w-3xl mx-auto">
            {ia.headline}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            {ia.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-evergreen rounded-[50px] p-8 md:p-12 mb-16 overflow-hidden"
        >
          <h3 className="text-white font-space font-bold text-xl mb-6">
            {ia.tableTitle}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-space text-xs tracking-wider uppercase py-3">{ia.tableHeaders.year}</th>
                  <th className="text-right text-white/40 font-space text-xs tracking-wider uppercase py-3">{ia.tableHeaders.sp500}</th>
                  <th className="text-right text-white/40 font-space text-xs tracking-wider uppercase py-3">{ia.tableHeaders.iul}</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map(({ year, sp500, iul, highlight }) => (
                  <tr key={year} className={`border-b border-white/5 ${highlight ? 'bg-white/5' : ''}`}>
                    <td className="py-3 text-white/70 font-space">{year}</td>
                    <td className={`py-3 text-right font-space font-semibold ${sp500.startsWith('-') ? 'text-red-400' : 'text-white/80'}`}>
                      {sp500}
                    </td>
                    <td className="py-3 text-right font-space font-semibold text-primary">
                      {iul}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 mt-6 text-xs font-space">
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/60">
              {ia.floorBadge}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/60">
              {ia.capBadge}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-space font-bold text-evergreen mb-8 text-center">
            {ia.whoTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {ia.audiences.map((audience, idx) => {
              const Icon = audienceIcons[idx];
              return (
                <div key={audience.label} className="border border-border rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-evergreen/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-evergreen" />
                  </div>
                  <h4 className="font-space font-bold text-foreground mb-1">{audience.label}</h4>
                  <p className="text-muted-foreground text-sm">{audience.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="text-center">
          <button
            onClick={() => navigate('/strategies/iul')}
            className="px-8 py-4 bg-evergreen text-white font-space font-bold text-sm tracking-wide rounded-xl hover:bg-evergreen/90 transition-colors shadow-lg"
          >
            {ia.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
