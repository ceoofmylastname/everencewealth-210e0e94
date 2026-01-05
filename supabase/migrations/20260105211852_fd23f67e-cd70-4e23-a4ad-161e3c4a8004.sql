ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS expert_insight TEXT,
ADD COLUMN IF NOT EXISTS decision_snapshot JSONB;

COMMENT ON COLUMN blog_articles.expert_insight IS 'Expert insight text for the article, required for high authority score.';
COMMENT ON COLUMN blog_articles.decision_snapshot IS 'JSONB object containing decision snapshot data (bestSuitedIf, lessSuitableIf, commonMistake, relatedQALink).';