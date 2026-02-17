import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustBadgeProps {
  icon: LucideIcon;
  text: string;
  delay?: number;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ icon: Icon, text, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-2 text-muted-foreground group cursor-default"
  >
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium relative">
      {text}
      <span className="absolute bottom-0 left-0 w-full h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'hsl(43,74%,49%)' }} />
    </span>
  </motion.div>
);
