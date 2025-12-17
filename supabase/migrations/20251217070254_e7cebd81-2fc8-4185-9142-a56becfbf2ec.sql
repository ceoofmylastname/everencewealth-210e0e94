-- Add investment stats and lifestyle features columns for brochure customization
ALTER TABLE city_brochures ADD COLUMN investment_stats JSONB DEFAULT '[]'::jsonb;
ALTER TABLE city_brochures ADD COLUMN lifestyle_features JSONB DEFAULT '[]'::jsonb;