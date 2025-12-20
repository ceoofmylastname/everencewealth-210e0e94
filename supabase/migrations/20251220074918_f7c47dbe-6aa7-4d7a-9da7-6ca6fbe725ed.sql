-- Add image_prompt column to location_pages table to store AI-generated image prompts
ALTER TABLE public.location_pages 
ADD COLUMN IF NOT EXISTS image_prompt TEXT;