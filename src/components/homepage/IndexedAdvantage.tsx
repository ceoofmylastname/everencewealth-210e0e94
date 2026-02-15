import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { year: '2014', sp500: 13.7, iul: 11.0 },
  { year: '2015', sp500: 1.4, iul: 1.4 },
  { year: '2016', sp500: 12.0, iul: 11.0 },
  { year: '2017', sp500: 21.8, iul: 11.0 },
  { year: '2018', sp500: -4.4, iul: 0.0 },
  { year: '2019', sp500: 31.5, iul: 11.0 },
  { year: '2020', sp500: 18.4, iul: 11.0 },
  { year: '2021', sp500: 28.7, iul: 11.0 },
  { year: '2022', sp500: -18.1, iul: 0.0 },
  { year: '2023', sp500: 26.3, iul: 11.0 },
];

const chartConfig = {
  sp500: { label: 'S&P 500', color: '#6366f1' },
  iul: { label: 'IUL Return', color: '#1A4D3E' },
};

const benefits = [
  'Tax-free death benefit',
  'Tax-free cash value access',
  'Living benefits (chronic/critical/terminal illness)',
  'No Required Minimum Distributions (RMDs)',
  'Asset protection from creditors',
  'Estate planning tool',
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } };
const fadeRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7 } } };
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const staggerItem = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4 } } };
const scaleUp = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

export function IndexedAdvantage() {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Headline */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-3xl md:text-5xl font-serif font-bold text-center text-slate-900 mb-4"
        >
          The Indexed Advantage: <span className="text-[#1A4D3E]">Growth Without the Risk</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-lg md:text-xl text-slate-600 text-center max-w-2xl mx-auto mb-16"
        >
          Participate in market gains. Protected from market losses.
        </motion.p>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — Chart */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <h3 className="text-xl font-semibold text-slate-800 mb-4">How Indexed Universal Life Works</h3>
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-medium text-emerald-800">
                Floor: 0% — never lose money
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 font-medium text-indigo-800">
                Cap: 10-12% — participate in up years
              </span>
            </div>

            <ChartContainer config={chartConfig} className="aspect-[4/3] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSp500" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradIul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A4D3E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1A4D3E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="sp500" stroke="#6366f1" fill="url(#gradSp500)" strokeWidth={2} />
                <Area type="monotone" dataKey="iul" stroke="#1A4D3E" fill="url(#gradIul)" strokeWidth={2.5} />
              </AreaChart>
            </ChartContainer>
          </motion.div>

          {/* Right — Benefits */}
          <div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="space-y-5 mb-8"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Key Benefits</h3>
              {benefits.map((b) => (
                <motion.div key={b} variants={staggerItem} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1A4D3E] mt-0.5 shrink-0" />
                  <span className="text-slate-700">{b}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Zero is Your Hero callout */}
            <motion.div
              variants={scaleUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="rounded-xl border border-[#1A4D3E]/20 bg-[#1A4D3E]/5 p-6"
            >
              <h4 className="text-lg font-bold text-[#1A4D3E] mb-2">Zero is Your Hero</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                In down-market years like 2008, 2018, and 2022, your IUL account is credited 0% — not negative.
                You never lose principal due to market downturns, allowing your wealth to compound without setbacks.
              </p>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="text-center mt-14"
        >
          <button
            onClick={() => navigate('/strategies')}
            className="inline-flex items-center gap-2 bg-[#1A4D3E] hover:bg-[#153F33] text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
          >
            See Indexed Strategy Comparison
          </button>
        </motion.div>
      </div>
    </section>
  );
}
