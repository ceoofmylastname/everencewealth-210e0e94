-- Add custom_fields column to store extracted lead data
ALTER TABLE public.emma_conversations 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_emma_conversations_custom_fields 
ON public.emma_conversations USING gin (custom_fields);

-- Add column comment for documentation
COMMENT ON COLUMN public.emma_conversations.custom_fields IS 'Structured lead data extracted from conversation: motivation, buyer_type, property_type, location_preference, budget_min, budget_max, bedrooms, bathrooms, timeline, location_priorities, must_have_features, lifestyle_priorities, visit_plans, purchase_timeline';