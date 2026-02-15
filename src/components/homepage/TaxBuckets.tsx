import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const buckets = [
  {
    icon: TrendingDown,
    label: 'TAXABLE',
    title: 'Taxable',
    treatment: 'Capital gains + ordinary income',
    examples: 'Brokerage accounts, savings, CDs',
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    icon: Clock,
    label: 'TAX-DEFERRED',
    title: 'Tax-Deferred',
    treatment: 'Ordinary income at withdrawal + RMDs',
    examples: '401(k), Traditional IRA, 403(b)',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
  },
  {
    icon: Shield,
    label: 'TAX-EXEMPT',
    title: 'Tax-Exempt',
    treatment: 'Zero taxes on qualified distributions',
    examples: 'Roth IRA, Indexed Universal Life, Municipal bonds',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
];

export const TaxBuckets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-[#F0F2F1]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl md:text-5xl font-serif font-bold text-center text-slate-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          The Three Tax Buckets Strategy
        </motion.h2>
        <motion.p
          className="text-center text-slate-500 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Strategic positioning across these buckets minimizes lifetime tax exposure
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {buckets.map(({ icon: Icon, label, title, treatment, examples, bg, border, iconBg, iconColor }) => (
            <motion.div
              key={label}
              variants={cardVariants}
              className={`${bg} rounded-xl border ${border} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <span className="text-xs font-semibold tracking-widest text-slate-600 uppercase">
                  {label}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm font-medium text-slate-700 mb-1">{treatment}</p>
              <p className="text-sm text-slate-500">{examples}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-[#1A4D3E] text-white font-semibold rounded-lg hover:bg-[#153F33] transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Get Your Tax Bucket Analysis
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TaxBuckets;
