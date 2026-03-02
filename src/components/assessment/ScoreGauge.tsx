import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TierKey } from '@/lib/assessment-scoring';

const TIER_COLORS: Record<TierKey, string> = {
  excellent: '#10B981',
  good: '#C5A059',
  fair: '#F59E0B',
  needs_attention: '#EF4444',
};

interface ScoreGaugeProps {
  score: number;
  tier: TierKey;
  tierLabel: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, tier, tierLabel }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const color = TIER_COLORS[tier];
  const circumference = 2 * Math.PI * 42;
  const strokeDash = (score / 100) * circumference;

  // Animate counter
  useEffect(() => {
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 md:w-44 md:h-44">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />
          {/* Score arc */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        {/* Center score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl md:text-5xl font-bold text-white font-serif">
            {displayScore}
          </span>
          <span className="text-white/40 text-xs uppercase tracking-widest mt-0.5">out of 100</span>
        </div>
      </div>
      {/* Tier label */}
      <span
        className="mt-4 text-lg font-semibold tracking-wide"
        style={{ color }}
      >
        {tierLabel}
      </span>
    </div>
  );
};
