import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBucketProps {
  position?: [number, number, number];
  fillLevel: number;
  color: string;
  label: string;
}

export const AnimatedBucket: React.FC<AnimatedBucketProps> = ({
  fillLevel,
  color,
  label,
}) => {
  const clampedFill = Math.max(0, Math.min(100, fillLevel));

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-24 h-32 rounded-b-2xl border-2 border-white/20 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl"
          initial={{ height: 0 }}
          animate={{ height: `${clampedFill}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ background: color, opacity: 0.7 }}
        />
      </div>
      <p className="text-xs font-bold tracking-wider uppercase" style={{ color }}>
        {label}
      </p>
      <p className="text-lg font-bold text-white">{clampedFill}%</p>
    </div>
  );
};
