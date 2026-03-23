
ALTER TABLE public.socorro_workshop_advisors 
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- Backfill existing rows with sequential values based on last_name order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY last_name, first_name) as rn
  FROM public.socorro_workshop_advisors
)
UPDATE public.socorro_workshop_advisors swa
SET display_order = ordered.rn
FROM ordered
WHERE swa.id = ordered.id;
