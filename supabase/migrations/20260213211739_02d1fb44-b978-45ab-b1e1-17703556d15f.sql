
-- Add new columns to apartments_properties for Google Images-style redesign
ALTER TABLE public.apartments_properties
  ADD COLUMN IF NOT EXISTS partner_source TEXT,
  ADD COLUMN IF NOT EXISTS partner_logo TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
