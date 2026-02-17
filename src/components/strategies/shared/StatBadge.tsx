import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatBadgeProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon: Icon, value, label, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 cursor-default transition-shadow duration-300 hover:shadow-[0_8px_30px_-5px_hsla(43,74%,49%,0.3)] hover:border-[hsla(43,74%,49%,0.4)]"
      style={{ perspective: '800px' }}
    >
      <Icon className="w-5 h-5 text-[hsl(43,74%,49%)]" />
      <div>
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-xs text-white/70">{label}</p>
      </div>
    </motion.div>
  );
};
