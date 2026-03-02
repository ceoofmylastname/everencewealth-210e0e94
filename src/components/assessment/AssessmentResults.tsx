import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScoreGauge } from './ScoreGauge';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RecommendationCard } from './RecommendationCard';
import type { AssessmentResult } from '@/lib/assessment-scoring';

interface AssessmentResultsProps {
  firstName: string;
  email: string;
  result: AssessmentResult;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({ firstName, email, result }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        <span className="text-primary/70 text-sm font-medium tracking-widest uppercase mb-3 block">
          Your Retirement Readiness Score
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
          Here's where you stand, {firstName}
        </h1>
      </motion.div>

      {/* Score Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center"
      >
        <ScoreGauge score={result.overallScore} tier={result.tier} tierLabel={result.tierLabel} />
      </motion.div>

      {/* Tier Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-white/50 text-center text-sm md:text-base max-w-lg mx-auto leading-relaxed"
      >
        {result.tierDescription}
      </motion.p>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <CategoryBreakdown categoryScores={result.categoryScores} />
      </motion.div>

      {/* Recommendations */}
      <div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-white font-serif font-bold text-lg mb-4"
        >
          Your Personalized Recommendations
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.recommendations.map((rec, i) => (
            <RecommendationCard key={rec.service} recommendation={rec} index={i} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="text-center space-y-4 pt-4"
      >
        <button
          onClick={() => navigate('/en/contact')}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 transition-all"
          style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}
        >
          Book Your Free Strategy Session
          <ArrowRight className="w-5 h-5" />
        </button>

        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 transition-all text-sm"
          >
            Return to Homepage
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-white/30 text-xs flex items-center justify-center gap-1.5 pt-2">
          <Mail className="w-3.5 h-3.5" />
          Your results have been emailed to {email}
        </p>
      </motion.div>
    </div>
  );
};
