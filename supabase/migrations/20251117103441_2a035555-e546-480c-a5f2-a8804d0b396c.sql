-- Add duplicate_count column to dead_link_replacements
ALTER TABLE dead_link_replacements 
ADD COLUMN IF NOT EXISTS duplicate_count INTEGER DEFAULT 0;

-- Create URL normalization helper function
CREATE OR REPLACE FUNCTION normalize_url(url TEXT, strip_query BOOLEAN DEFAULT FALSE, domain_only BOOLEAN DEFAULT FALSE)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
  domain_part TEXT;
BEGIN
  -- Basic normalization
  normalized := LOWER(TRIM(url));
  
  -- Remove trailing slash
  IF normalized LIKE '%/' THEN
    normalized := LEFT(normalized, LENGTH(normalized) - 1);
  END IF;
  
  -- Strip query parameters if requested
  IF strip_query AND normalized LIKE '%?%' THEN
    normalized := SPLIT_PART(normalized, '?', 1);
  END IF;
  
  -- Extract domain only if requested
  IF domain_only THEN
    -- Remove protocol
    normalized := REGEXP_REPLACE(normalized, '^https?://', '');
    -- Extract just the domain (everything before first /)
    domain_part := SPLIT_PART(normalized, '/', 1);
    -- Remove www. prefix if present
    domain_part := REGEXP_REPLACE(domain_part, '^www\.', '');
    RETURN domain_part;
  END IF;
  
  RETURN normalized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop existing function to allow changing return type
DROP FUNCTION IF EXISTS find_articles_with_citation(TEXT, BOOLEAN);

-- Rewrite find_articles_with_citation with fuzzy matching fallback layers
CREATE FUNCTION find_articles_with_citation(citation_url TEXT, published_only BOOLEAN DEFAULT TRUE)
RETURNS TABLE(
  id UUID,
  headline TEXT,
  detailed_content TEXT,
  language TEXT,
  status TEXT,
  external_citations JSONB,
  match_type TEXT
) AS $$
BEGIN
  -- Layer 1: Exact match (fastest, most precise)
  RETURN QUERY
  SELECT 
    ba.id,
    ba.headline,
    ba.detailed_content,
    ba.language,
    ba.status,
    ba.external_citations,
    'exact'::TEXT as match_type
  FROM blog_articles ba
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ba.external_citations) AS citation
    WHERE citation->>'url' = citation_url
  )
  AND (NOT published_only OR ba.status = 'published');
  
  -- If exact match found, return immediately
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Layer 2: Normalized match (no trailing slash, lowercase)
  RETURN QUERY
  SELECT 
    ba.id,
    ba.headline,
    ba.detailed_content,
    ba.language,
    ba.status,
    ba.external_citations,
    'normalized'::TEXT as match_type
  FROM blog_articles ba
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ba.external_citations) AS citation
    WHERE normalize_url(citation->>'url') = normalize_url(citation_url)
  )
  AND (NOT published_only OR ba.status = 'published');
  
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Layer 3: Match without query params
  RETURN QUERY
  SELECT 
    ba.id,
    ba.headline,
    ba.detailed_content,
    ba.language,
    ba.status,
    ba.external_citations,
    'without_params'::TEXT as match_type
  FROM blog_articles ba
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ba.external_citations) AS citation
    WHERE normalize_url(citation->>'url', TRUE) = normalize_url(citation_url, TRUE)
  )
  AND (NOT published_only OR ba.status = 'published');
  
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Layer 4: Domain-level match (fallback for same-domain different paths)
  RETURN QUERY
  SELECT 
    ba.id,
    ba.headline,
    ba.detailed_content,
    ba.language,
    ba.status,
    ba.external_citations,
    'domain_only'::TEXT as match_type
  FROM blog_articles ba
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ba.external_citations) AS citation
    WHERE normalize_url(citation->>'url', FALSE, TRUE) = normalize_url(citation_url, FALSE, TRUE)
  )
  AND (NOT published_only OR ba.status = 'published');
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create safe cleanup function for existing duplicates
CREATE OR REPLACE FUNCTION cleanup_duplicate_replacements()
RETURNS TABLE (
  kept_id UUID,
  original_url TEXT,
  replacement_url TEXT,
  duplicates_merged INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- For each unique pair, keep the BEST one and merge duplicates
  RETURN QUERY
  WITH ranked_duplicates AS (
    SELECT 
      id,
      dlr.original_url,
      dlr.replacement_url,
      confidence_score,
      created_at,
      status,
      ROW_NUMBER() OVER (
        PARTITION BY dlr.original_url, dlr.replacement_url 
        ORDER BY 
          CASE WHEN status = 'applied' THEN 1
               WHEN status = 'approved' THEN 2
               ELSE 3 END,
          confidence_score DESC NULLS LAST,
          created_at ASC
      ) as rn,
      COUNT(*) OVER (PARTITION BY dlr.original_url, dlr.replacement_url) as dup_count
    FROM dead_link_replacements dlr
    WHERE status IN ('pending', 'suggested')
    AND created_at < NOW() - INTERVAL '24 hours'
  ),
  to_keep AS (
    SELECT id, original_url, replacement_url, (dup_count - 1)::INTEGER as dups_to_merge
    FROM ranked_duplicates
    WHERE rn = 1 AND dup_count > 1
  ),
  to_delete AS (
    SELECT rd.id
    FROM ranked_duplicates rd
    WHERE rd.rn > 1
  ),
  updated_records AS (
    UPDATE dead_link_replacements dlr
    SET duplicate_count = tk.dups_to_merge,
        updated_at = NOW()
    FROM to_keep tk
    WHERE dlr.id = tk.id
    RETURNING dlr.id, dlr.original_url, dlr.replacement_url, dlr.duplicate_count
  )
  SELECT * FROM updated_records;
  
  -- Delete the duplicates
  DELETE FROM dead_link_replacements
  WHERE id IN (SELECT id FROM to_delete);
END;
$$;