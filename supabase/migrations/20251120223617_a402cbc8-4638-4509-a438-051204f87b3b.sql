-- Add article_structure field for chunked/resume generation support
ALTER TABLE cluster_generations 
ADD COLUMN IF NOT EXISTS article_structure jsonb NULL;

-- Add helpful comments
COMMENT ON COLUMN cluster_generations.article_structure IS 'Stores the parsed article structures from Step 1 for resume capability';
COMMENT ON COLUMN cluster_generations.total_articles IS 'Target number of articles to generate (default 6: 3 TOFU, 2 MOFU, 1 BOFU)';