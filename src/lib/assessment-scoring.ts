// ── Types ──────────────────────────────────────────────────────

export type CategoryKey = 'savings' | 'tax' | 'protection' | 'timeline';
export type TierKey = 'excellent' | 'good' | 'fair' | 'needs_attention';

export interface AssessmentQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: string[];
  category: CategoryKey;
}

export interface Recommendation {
  service: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium';
  link: string;
}

export interface AssessmentResult {
  overallScore: number;
  categoryScores: Record<CategoryKey, number>;
  tier: TierKey;
  tierLabel: string;
  tierDescription: string;
  recommendations: Recommendation[];
}

// ── Category Configuration ────────────────────────────────────

export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = {
  savings: 0.30,
  tax: 0.25,
  protection: 0.25,
  timeline: 0.20,
};

export const CATEGORY_META: Record<CategoryKey, { label: string; color: string }> = {
  savings: { label: 'Savings & Preparedness', color: '#10B981' },
  tax: { label: 'Tax Efficiency', color: '#C5A059' },
  protection: { label: 'Risk & Protection', color: '#3B82F6' },
  timeline: { label: 'Retirement Timeline', color: '#8B5CF6' },
};

// ── Score Tiers ───────────────────────────────────────────────

const TIER_CONFIG: Record<TierKey, { label: string; description: string }> = {
  excellent: {
    label: 'Excellent',
    description: "You're in a strong position. A few optimizations could maximize your retirement income even further.",
  },
  good: {
    label: 'Good',
    description: 'You have a solid foundation with some key areas that could be strengthened to protect and grow your wealth.',
  },
  fair: {
    label: 'Fair',
    description: 'There are gaps in your strategy that could cost you significantly in retirement. A professional review is recommended.',
  },
  needs_attention: {
    label: 'Needs Attention',
    description: 'Your retirement readiness has significant gaps. Taking action now can make a major difference in your financial future.',
  },
};

// ── Questions ─────────────────────────────────────────────────

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'retirement_concern',
    question: 'What is your primary retirement concern?',
    subtitle: 'Select the option that best describes your situation',
    category: 'savings',
    options: [
      'Running out of money in retirement',
      'Paying too much in taxes',
      'Not having enough saved',
      'Protecting assets from market volatility',
      'Leaving a legacy for my family',
    ],
  },
  {
    id: 'age_range',
    question: 'What is your current age range?',
    subtitle: 'This helps us tailor strategies to your timeline',
    category: 'timeline',
    options: ['Under 30', '30-39', '40-49', '50-59', '60+'],
  },
  {
    id: 'tax_strategy_familiarity',
    question: 'How familiar are you with tax-free retirement strategies?',
    subtitle: 'No wrong answer here - we meet you where you are',
    category: 'tax',
    options: [
      'Not familiar at all',
      "I've heard of them but don't know details",
      'Somewhat familiar',
      'Very familiar - I want advanced strategies',
    ],
  },
  {
    id: 'savings_status',
    question: 'How would you describe your current retirement savings?',
    subtitle: 'Be honest - this helps us give you accurate results',
    category: 'savings',
    options: [
      "I haven't started saving yet",
      'I save occasionally but not consistently',
      'I contribute regularly to a 401(k) or IRA',
      'I max out my retirement contributions each year',
      'I have multiple investment vehicles beyond just a 401(k)',
    ],
  },
  {
    id: 'income_range',
    question: 'What is your approximate annual household income?',
    subtitle: 'This determines which strategies work best for you',
    category: 'savings',
    options: [
      'Under $50,000',
      '$50,000 - $100,000',
      '$100,000 - $200,000',
      '$200,000 - $500,000',
      '$500,000+',
    ],
  },
  {
    id: 'tax_diversification',
    question: 'Where do you currently hold most of your retirement savings?',
    subtitle: 'Tax diversification is key to retirement efficiency',
    category: 'tax',
    options: [
      "I don't have retirement savings yet",
      'Mostly in a traditional 401(k) or IRA (pre-tax)',
      'Split between pre-tax and Roth accounts',
      'I use Roth, HSA, and other tax-free vehicles',
      'I have a multi-bucket strategy (pre-tax, Roth, taxable, life insurance)',
    ],
  },
  {
    id: 'insurance_coverage',
    question: 'Which types of insurance or asset protection do you currently have?',
    subtitle: 'Protection is the foundation of any wealth strategy',
    category: 'protection',
    options: [
      'Just basic employer benefits (health, maybe a small life policy)',
      'Health insurance plus a term life policy',
      'Health, life, and disability insurance',
      'Comprehensive coverage including umbrella/liability policies',
      'Full suite including trusts, LLCs, or annuities for asset protection',
    ],
  },
  {
    id: 'market_volatility',
    question: 'How would you react if the market dropped 30% a year before your planned retirement?',
    subtitle: 'Your answer reveals how protected your strategy really is',
    category: 'protection',
    options: [
      "I'd panic and probably sell everything",
      "I'd be very worried but might hold on",
      "I'd be concerned but trust my strategy to recover",
      "I wouldn't be concerned - my portfolio has downside protection",
      "It wouldn't affect my retirement income at all - it's already protected",
    ],
  },
  {
    id: 'retirement_plan_formality',
    question: 'Do you have a formal, written retirement plan?',
    subtitle: 'A plan turns hope into a roadmap',
    category: 'timeline',
    options: [
      "No, I haven't really thought about it",
      'I have a general idea but nothing written',
      "I've used online calculators to estimate what I need",
      "I've worked with a financial advisor on a plan",
      'I have a comprehensive plan that is reviewed annually',
    ],
  },
  {
    id: 'legacy_planning',
    question: 'Have you taken steps to protect your wealth for future generations?',
    subtitle: 'Legacy planning ensures your wealth outlives you',
    category: 'protection',
    options: [
      "No, I haven't thought about legacy planning",
      'I have a basic will',
      'I have a will and life insurance beneficiaries designated',
      'I have a living trust and estate plan',
      'I have a comprehensive estate plan including trusts, life insurance, and gifting strategies',
    ],
  },
];

// ── Scoring Table (questionId -> optionIndex -> points) ───────

const SCORING_TABLE: Record<string, number[]> = {
  retirement_concern:        [3, 7, 2, 6, 8],
  age_range:                 [10, 8, 6, 4, 2],
  tax_strategy_familiarity:  [2, 4, 7, 10],
  savings_status:            [1, 3, 6, 8, 10],
  income_range:              [3, 5, 7, 9, 10],
  tax_diversification:       [1, 3, 6, 8, 10],
  insurance_coverage:        [2, 4, 6, 8, 10],
  market_volatility:         [1, 3, 6, 9, 10],
  retirement_plan_formality: [1, 3, 5, 8, 10],
  legacy_planning:           [1, 3, 5, 8, 10],
};

// ── Scoring Functions ─────────────────────────────────────────

function getOptionIndex(questionId: string, selectedOption: string): number {
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return 0;
  const idx = question.options.indexOf(selectedOption);
  return idx >= 0 ? idx : 0;
}

function getPointsForAnswer(questionId: string, selectedOption: string): number {
  const table = SCORING_TABLE[questionId];
  if (!table) return 0;
  const idx = getOptionIndex(questionId, selectedOption);
  return table[idx] ?? 0;
}

export function calculateScores(answers: Record<string, string>): AssessmentResult {
  // 1. Calculate raw points per question
  const rawPoints: Record<string, number> = {};
  for (const [qId, selectedOption] of Object.entries(answers)) {
    rawPoints[qId] = getPointsForAnswer(qId, selectedOption);
  }

  // 2. Calculate category scores (normalized to 0-100)
  const categoryScores: Record<CategoryKey, number> = {
    savings: 0,
    tax: 0,
    protection: 0,
    timeline: 0,
  };

  for (const category of Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]) {
    const questionsInCategory = QUESTIONS.filter((q) => q.category === category);
    const sum = questionsInCategory.reduce((acc, q) => acc + (rawPoints[q.id] || 0), 0);
    const maxPossible = questionsInCategory.length * 10;
    categoryScores[category] = maxPossible > 0 ? Math.round((sum / maxPossible) * 100) : 0;
  }

  // 3. Calculate overall weighted score
  const overallScore = Math.round(
    (Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]).reduce(
      (acc, cat) => acc + categoryScores[cat] * CATEGORY_WEIGHTS[cat],
      0
    )
  );

  // 4. Determine tier
  const tier: TierKey =
    overallScore >= 80
      ? 'excellent'
      : overallScore >= 60
        ? 'good'
        : overallScore >= 40
          ? 'fair'
          : 'needs_attention';

  // 5. Generate recommendations
  const recommendations = generateRecommendations(categoryScores, answers);

  return {
    overallScore,
    categoryScores,
    tier,
    tierLabel: TIER_CONFIG[tier].label,
    tierDescription: TIER_CONFIG[tier].description,
    recommendations,
  };
}

// ── Recommendation Engine ─────────────────────────────────────

function generateRecommendations(
  categoryScores: Record<CategoryKey, number>,
  answers: Record<string, string>
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Low Tax Efficiency -> Tax-Free Retirement
  if (categoryScores.tax < 60) {
    recs.push({
      service: 'Tax-Free Retirement',
      title: 'Unlock Tax-Free Retirement Income',
      description:
        'Strategies like Roth conversions, IUL policies, municipal bonds, and HSAs can help you keep more of your money in retirement.',
      icon: 'receipt',
      priority: categoryScores.tax < 40 ? 'high' : 'medium',
      link: '/en/strategies/tax-free-retirement',
    });
  }

  // Low Savings -> Index Strategy (IUL)
  if (categoryScores.savings < 50) {
    recs.push({
      service: 'Index Strategy',
      title: 'Accelerate Your Retirement Savings',
      description:
        'An Index Strategy can supplement your retirement savings with tax-free growth linked to S&P 500 performance - with zero downside risk to your principal.',
      icon: 'trending-up',
      priority: 'high',
      link: '/en/strategies/index-universal-life',
    });
  }

  // Low Protection -> Asset Protection
  if (categoryScores.protection < 60) {
    recs.push({
      service: 'Asset Protection',
      title: 'Shield Your Wealth from Risk',
      description:
        'Trusts, LLCs, and properly structured annuities can protect your assets from lawsuits, market crashes, and unexpected events.',
      icon: 'shield',
      priority: categoryScores.protection < 40 ? 'high' : 'medium',
      link: '/en/strategies/asset-protection',
    });
  }

  // Low legacy planning -> Whole Life
  const legacyIdx = getOptionIndex('legacy_planning', answers.legacy_planning || '');
  if (categoryScores.protection < 70 && legacyIdx <= 2) {
    recs.push({
      service: 'Whole Life Insurance',
      title: 'Build a Tax-Free Legacy',
      description:
        'Whole life insurance provides guaranteed cash value growth, infinite banking capabilities, and a tax-free death benefit for your family.',
      icon: 'heart',
      priority: 'medium',
      link: '/en/strategies/whole-life',
    });
  }

  // Always include consultation CTA
  recs.push({
    service: 'Personalized Strategy Session',
    title: 'Get Your Custom Retirement Roadmap',
    description:
      'Our independent advisors will review your assessment results and create a step-by-step plan tailored to your unique situation.',
    icon: 'calendar',
    priority: 'high',
    link: '/en/contact',
  });

  return recs;
}
