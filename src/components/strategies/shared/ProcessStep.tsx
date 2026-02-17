import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  isLast?: boolean;
}

export const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, icon: Icon, delay = 0, isLast = false }) => (
  <motion.div
    initial={{ opacity: 0, x: 30, rotateX: 8 }}
    whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="flex gap-5 relative"
    style={{ perspective: '1000px' }}
  >
    {/* Connecting gold line */}
    {!isLast && (
      <div className="absolute left-6 top-14 w-px h-[calc(100%+12px)]" style={{ background: 'linear-gradient(180deg, hsl(43,74%,49%) 0%, transparent 100%)' }} />
    )}
    <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 shadow-[0_0_20px_hsla(43,74%,49%,0.2)]" style={{ background: 'linear-gradient(135deg, hsl(43,74%,49%) 0%, hsl(43,74%,55%) 100%)' }}>
      <span className="text-lg font-bold" style={{ color: 'hsl(160,48%,12%)' }}>{number}</span>
    </div>
    <motion.div
      className="flex-1 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 p-4 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] transition-shadow duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  </motion.div>
);
