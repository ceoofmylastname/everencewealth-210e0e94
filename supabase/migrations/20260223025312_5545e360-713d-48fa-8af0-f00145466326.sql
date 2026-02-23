
-- Deactivate older duplicate slugs, keeping only the most recent per advisor
WITH ranked AS (
  SELECT id, advisor_id,
    ROW_NUMBER() OVER (PARTITION BY advisor_id ORDER BY created_at DESC) as rn
  FROM public.advisor_slugs
  WHERE is_active = true
)
UPDATE public.advisor_slugs
SET is_active = false
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Add unique partial index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_advisor_slugs_one_active_per_advisor
ON public.advisor_slugs (advisor_id)
WHERE is_active = true;
