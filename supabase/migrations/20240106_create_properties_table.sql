-- Create properties table for admin management
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Internal reference (admin only, not shown to public)
  internal_name TEXT NOT NULL,
  internal_ref TEXT UNIQUE,
  
  -- Public-facing info
  category TEXT NOT NULL CHECK (category IN ('apartment', 'villa')),
  location TEXT NOT NULL,
  
  -- Property details
  beds_min INTEGER NOT NULL,
  beds_max INTEGER,
  baths INTEGER NOT NULL,
  size_sqm INTEGER NOT NULL,
  price_eur INTEGER NOT NULL,
  
  -- Images (array of 3-4 URLs)
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Multilingual descriptions (public teaser only)
  descriptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_properties_active ON public.properties(is_active);
CREATE INDEX idx_properties_order ON public.properties(display_order);

-- RLS Policies
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active properties"
  ON public.properties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage properties"
  ON public.properties FOR ALL
  USING (auth.role() = 'authenticated');
