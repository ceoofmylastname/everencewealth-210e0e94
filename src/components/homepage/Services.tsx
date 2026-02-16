import React from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Shield, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    icon: PiggyBank,
    title: 'Retirement Planning',
    description: 'Tax-efficient strategies that create predictable, tax-free retirement income.',
    points: ['Indexed Universal Life (IUL)', 'Tax-free distribution strategies', 'Social Security optimization', 'RMD avoidance planning'],
    link: '/strategies/tax-free-retirement',
  },
  {
    icon: Shield,
    title: 'Wealth Protection',
    description: 'Guard your assets against market volatility, lawsuits, and unexpected events.',
    points: ['Asset protection planning', 'Living benefits coverage', 'Key person insurance', 'Business succession'],
    link: '/strategies/asset-protection',
  },
  {
    icon: Users,
    title: 'Legacy Planning',
    description: 'Create multi-generational wealth that transfers tax-efficiently to your heirs.',
    points: ['Estate tax minimization', 'Irrevocable Life Insurance Trusts', 'Charitable giving strategies', 'Dynasty planning'],
    link: '/strategies/whole-life',
  },
];

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
            Our Services
          </p>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-foreground">
            How We Help
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map(({ icon: Icon, title, description, points, link }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className="group border border-border rounded-[30px] p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:bg-evergreen transition-colors duration-300">
                <Icon className="w-6 h-6 text-evergreen group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-space font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{description}</p>
              <ul className="space-y-2.5 mb-6">
                {points.map((point) => (
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
                Learn More <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
