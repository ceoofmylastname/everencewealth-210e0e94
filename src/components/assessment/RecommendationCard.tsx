import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Heart, Receipt, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Recommendation } from '@/lib/assessment-scoring';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  'trending-up': TrendingUp,
  shield: Shield,
  heart: Heart,
  receipt: Receipt,
  calendar: Calendar,
};

const PRIORITY_STYLES = {
  high: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: '#C5A059', label: 'High Priority' },
  medium: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: '#10B981', label: 'Recommended' },
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index }) => {
  const navigate = useNavigate();
  const Icon = ICON_MAP[recommendation.icon] || Calendar;
  const style = PRIORITY_STYLES[recommendation.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 relative overflow-hidden cursor-pointer hover:bg-white/[0.09] transition-colors"
      style={{ borderLeftWidth: 3, borderLeftColor: style.border }}
      onClick={() => navigate(recommendation.link)}
    >
      {/* Priority badge */}
      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${style.bg} ${style.text} mb-3`}>
        {style.label}
      </span>

      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${style.border}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: style.border }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">{recommendation.title}</h4>
          <p className="text-white/50 text-sm leading-relaxed">{recommendation.description}</p>
          <span className="inline-flex items-center gap-1 text-xs font-medium mt-3" style={{ color: style.border }}>
            Learn More <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
