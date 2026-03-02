import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_META, type CategoryKey } from '@/lib/assessment-scoring';

interface CategoryBreakdownProps {
  categoryScores: Record<CategoryKey, number>;
}

const CATEGORY_ORDER: CategoryKey[] = ['savings', 'tax', 'protection', 'timeline'];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categoryScores }) => {
  return (
    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
      <h3 className="text-white font-serif font-bold text-lg mb-6">Category Breakdown</h3>
      <div className="space-y-5">
        {CATEGORY_ORDER.map((category, i) => {
          const { label, color } = CATEGORY_META[category];
          const score = categoryScores[category];
          return (
            <div key={category}>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/70 text-sm">{label}</span>
                <span className="text-white font-semibold text-sm">{score}%</span>
              </div>
              <div className="h-3 bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
