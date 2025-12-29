-- Drop the existing constraint
ALTER TABLE qa_generation_jobs 
DROP CONSTRAINT IF EXISTS faq_generation_jobs_mode_check;

-- Add updated constraint with 'background' mode
ALTER TABLE qa_generation_jobs 
ADD CONSTRAINT faq_generation_jobs_mode_check 
CHECK (mode = ANY (ARRAY['bulk', 'selective', 'single', 'city-qa', 'background']));