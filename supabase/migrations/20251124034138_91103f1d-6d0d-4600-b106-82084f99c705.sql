CREATE OR REPLACE FUNCTION public.track_citation_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete old tracking records for this article
  DELETE FROM citation_usage_tracking WHERE article_id = NEW.id;
  
  -- Insert new tracking records (DISTINCT URLs only - prevents duplicate key violations)
  IF NEW.external_citations IS NOT NULL AND jsonb_array_length(NEW.external_citations) > 0 THEN
    INSERT INTO citation_usage_tracking (article_id, citation_url, citation_source, anchor_text, position_in_article)
    SELECT DISTINCT ON ((citation->>'url')::TEXT)
      NEW.id,
      (citation->>'url')::TEXT,
      (citation->>'source')::TEXT,
      (citation->>'text')::TEXT,
      ROW_NUMBER() OVER ()::INTEGER
    FROM jsonb_array_elements(NEW.external_citations) AS citation
    WHERE citation->>'url' IS NOT NULL
    ORDER BY (citation->>'url')::TEXT;
  END IF;
  
  RETURN NEW;
END;
$function$;