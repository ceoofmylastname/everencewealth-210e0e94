-- Update the enforce_qa_cap function to cap at 24 per language per cluster (6 articles × 4 Q&A types)
CREATE OR REPLACE FUNCTION public.enforce_qa_cap()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
BEGIN
  -- Only enforce cap if cluster_id is set
  IF NEW.cluster_id IS NOT NULL THEN
    -- Count existing Q&As for this cluster + language combo (excluding current insert)
    SELECT COUNT(*) INTO current_count
    FROM qa_pages
    WHERE cluster_id = NEW.cluster_id
    AND language = NEW.language
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Allow max 24 Q&As per language per cluster (6 articles × 4 Q&A types per article)
    IF current_count >= 24 THEN
      RAISE EXCEPTION 'Q&A cap reached: cluster % already has % Q&As for language % (max 24 per language)', 
        NEW.cluster_id, current_count, NEW.language;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;