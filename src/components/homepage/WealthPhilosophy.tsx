import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const traditionalItems = [
  'Save and wait',
  'Gamble on market timing',
  'Accept volatility as "normal"',
  'Pay fees to middlemen',
  'Hope your nest egg lasts',
  'Stress over RMDs and taxes',
];

const everenceItems = [
  'Build tax-free cash flow',
  'Eliminate sequence-of-returns risk',
  'Protect principal with floor guarantees',
  'Work with a fiduciary, not a salesman',
  'Create generational wealth transfer',
  'Control your tax destiny',
];

export function WealthPhilosophy() {
  return (
    <section className="bg-[#F0F2F1] py-20 md:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            From Accumulation to <span className="text-[#1A4D3E]">Abundance</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Rethinking the retirement model
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Traditional Model */}
          <motion.div
            variants={cardVariants}
            className="bg-red-50 border border-red-200 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-red-700 mb-6">Traditional Model</h3>
            <ul className="space-y-4">
              {traditionalItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Everence Model */}
          <motion.div
            variants={cardVariants}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-[#1A4D3E] mb-6">Everence Model</h3>
            <ul className="space-y-4">
              {everenceItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1A4D3E] mt-0.5 shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Pullquote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto border-l-4 border-[#1A4D3E] pl-6 py-2"
        >
          <p className="text-xl md:text-2xl font-serif italic text-slate-800">
            "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1."
          </p>
          <footer className="mt-3 text-sm text-slate-500">— Warren Buffett</footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
