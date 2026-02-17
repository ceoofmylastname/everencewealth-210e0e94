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
    className="flex items-center gap-2 text-muted-foreground"
  >
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium">{text}</span>
  </motion.div>
);
