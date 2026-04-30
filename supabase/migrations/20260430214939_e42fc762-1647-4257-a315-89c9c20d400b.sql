
-- =============================================================================
-- Diff 2 + Diff 3 schema (resubmit, backfill removed):
-- Atomic cluster completion gate + forensics observability
-- =============================================================================

-- 1. Diff 2: missing_components column on cluster_completion_progress
ALTER TABLE public.cluster_completion_progress
  ADD COLUMN IF NOT EXISTS missing_components jsonb DEFAULT '{}'::jsonb;

-- 2. Diff 2: verify_cluster_complete — atomic 6-gate check
CREATE OR REPLACE FUNCTION public.verify_cluster_complete(_cluster_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  en_blogs int := 0;
  es_blogs int := 0;
  en_qas int := 0;
  es_qas int := 0;
  orphan_en_blogs int := 0;
  orphan_en_qas int := 0;
  blogs_without_citations int := 0;
  passed boolean;
  result jsonb;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE language = 'en' AND status = 'published'),
    COUNT(*) FILTER (WHERE language = 'es' AND status = 'published')
  INTO en_blogs, es_blogs
  FROM public.blog_articles
  WHERE cluster_id = _cluster_id;

  SELECT
    COUNT(*) FILTER (WHERE language = 'en' AND status = 'published'),
    COUNT(*) FILTER (WHERE language = 'es' AND status = 'published')
  INTO en_qas, es_qas
  FROM public.qa_pages
  WHERE cluster_id = _cluster_id;

  SELECT COUNT(*) INTO orphan_en_blogs
  FROM public.blog_articles en
  WHERE en.cluster_id = _cluster_id
    AND en.language = 'en'
    AND en.status = 'published'
    AND en.hreflang_group_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.blog_articles es
      WHERE es.hreflang_group_id = en.hreflang_group_id
        AND es.language = 'es'
        AND es.status = 'published'
    );

  SELECT COUNT(*) INTO orphan_en_qas
  FROM public.qa_pages en
  WHERE en.cluster_id = _cluster_id
    AND en.language = 'en'
    AND en.status = 'published'
    AND en.hreflang_group_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.qa_pages es
      WHERE es.hreflang_group_id = en.hreflang_group_id
        AND es.language = 'es'
        AND es.status = 'published'
    );

  SELECT COUNT(*) INTO blogs_without_citations
  FROM public.blog_articles
  WHERE cluster_id = _cluster_id
    AND status = 'published'
    AND (external_citations IS NULL
         OR jsonb_typeof(external_citations) <> 'array'
         OR jsonb_array_length(external_citations) < 1);

  passed := (en_blogs = 6
             AND es_blogs = 6
             AND en_qas = 24
             AND es_qas = 24
             AND orphan_en_blogs = 0
             AND orphan_en_qas = 0
             AND blogs_without_citations = 0);

  result := jsonb_build_object(
    'passed', passed,
    'cluster_id', _cluster_id,
    'verified_at', now(),
    'gates', jsonb_build_object(
      'en_blogs',                jsonb_build_object('actual', en_blogs,                'expected', 6,  'passed', en_blogs = 6),
      'es_blogs',                jsonb_build_object('actual', es_blogs,                'expected', 6,  'passed', es_blogs = 6),
      'en_qas',                  jsonb_build_object('actual', en_qas,                  'expected', 24, 'passed', en_qas = 24),
      'es_qas',                  jsonb_build_object('actual', es_qas,                  'expected', 24, 'passed', es_qas = 24),
      'hreflang_orphan_blogs',   jsonb_build_object('actual', orphan_en_blogs,         'expected', 0,  'passed', orphan_en_blogs = 0),
      'hreflang_orphan_qas',     jsonb_build_object('actual', orphan_en_qas,           'expected', 0,  'passed', orphan_en_qas = 0),
      'blogs_without_citations', jsonb_build_object('actual', blogs_without_citations, 'expected', 0,  'passed', blogs_without_citations = 0)
    )
  );

  RETURN result;
END;
$$;

-- 3. Diff 3: cluster_generation_failures — full Claude payload on failure
CREATE TABLE IF NOT EXISTS public.cluster_generation_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL,
  cluster_id uuid,
  article_index int NOT NULL,
  attempt int NOT NULL,
  failure_kind text NOT NULL,
  stop_reason text,
  text_len int,
  raw_response text,
  error_message text,
  prompt_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cgf_generation_id ON public.cluster_generation_failures(generation_id);
CREATE INDEX IF NOT EXISTS idx_cgf_cluster_id    ON public.cluster_generation_failures(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cgf_created_at    ON public.cluster_generation_failures(created_at DESC);

ALTER TABLE public.cluster_generation_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read failures"
  ON public.cluster_generation_failures FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 4. Diff 3: cluster_id column on cluster_generations (forward-only, no backfill)
ALTER TABLE public.cluster_generations
  ADD COLUMN IF NOT EXISTS cluster_id uuid;

CREATE INDEX IF NOT EXISTS idx_cluster_generations_cluster_id
  ON public.cluster_generations(cluster_id);
