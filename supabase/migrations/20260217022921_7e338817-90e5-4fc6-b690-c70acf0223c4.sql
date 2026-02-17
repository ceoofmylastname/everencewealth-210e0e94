
-- Create atomic increment function for brochure download counts
CREATE OR REPLACE FUNCTION public.increment_brochure_download_count(p_brochure_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE brochures 
  SET download_count = COALESCE(download_count, 0) + 1 
  WHERE id = p_brochure_id;
END;
$$;
