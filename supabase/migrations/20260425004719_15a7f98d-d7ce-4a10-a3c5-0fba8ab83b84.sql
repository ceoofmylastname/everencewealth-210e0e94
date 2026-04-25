
-- ============================================================
-- Compliance trigger: block the regulated term "fiduciary"
-- in author and content metadata/schema fields.
-- Long-form body fields are deliberately NOT checked so that
-- compliance disclaimers (e.g. "does not provide fiduciary
-- investment advice") can remain in editorial content.
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_fiduciary_term_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pattern TEXT := '\yfiduciar';  -- whole-word stem: fiduciary / fiduciaries
  v_field TEXT;
  v_value TEXT;
  v_arr TEXT[];
  v_item TEXT;
BEGIN
  IF TG_TABLE_NAME = 'authors' THEN
    -- credentials is text[]; check each element
    IF NEW.credentials IS NOT NULL THEN
      v_arr := NEW.credentials;
      FOREACH v_item IN ARRAY v_arr LOOP
        IF v_item ~* v_pattern THEN
          RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in authors.credentials. Offending value: %', v_item;
        END IF;
      END LOOP;
    END IF;

    IF NEW.job_title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in authors.job_title.';
    END IF;
    IF NEW.bio ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in authors.bio.';
    END IF;
    IF NEW.name ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in authors.name.';
    END IF;

  ELSIF TG_TABLE_NAME = 'blog_articles' THEN
    IF NEW.headline ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in blog_articles.headline.';
    END IF;
    IF NEW.meta_title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in blog_articles.meta_title.';
    END IF;
    IF NEW.meta_description ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in blog_articles.meta_description.';
    END IF;
    IF NEW.slug ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in blog_articles.slug.';
    END IF;
    IF NEW.speakable_answer ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in blog_articles.speakable_answer.';
    END IF;

  ELSIF TG_TABLE_NAME = 'qa_pages' THEN
    IF NEW.title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in qa_pages.title.';
    END IF;
    IF NEW.meta_title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in qa_pages.meta_title.';
    END IF;
    IF NEW.meta_description ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in qa_pages.meta_description.';
    END IF;
    IF NEW.slug ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in qa_pages.slug.';
    END IF;
    IF NEW.speakable_answer ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in qa_pages.speakable_answer.';
    END IF;

  ELSIF TG_TABLE_NAME = 'location_pages' THEN
    IF NEW.headline ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in location_pages.headline.';
    END IF;
    IF NEW.meta_title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in location_pages.meta_title.';
    END IF;
    IF NEW.meta_description ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in location_pages.meta_description.';
    END IF;
    IF NEW.topic_slug ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in location_pages.topic_slug.';
    END IF;
    IF NEW.speakable_answer ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in location_pages.speakable_answer.';
    END IF;

  ELSIF TG_TABLE_NAME = 'comparison_pages' THEN
    IF NEW.headline ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in comparison_pages.headline.';
    END IF;
    IF NEW.meta_title ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in comparison_pages.meta_title.';
    END IF;
    IF NEW.meta_description ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in comparison_pages.meta_description.';
    END IF;
    IF NEW.slug ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in comparison_pages.slug.';
    END IF;
    IF NEW.speakable_answer ~* v_pattern THEN
      RAISE EXCEPTION 'Compliance block: the term "fiduciary" is not permitted in comparison_pages.speakable_answer.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_fiduciary_authors ON public.authors;
CREATE TRIGGER trg_enforce_fiduciary_authors
BEFORE INSERT OR UPDATE ON public.authors
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiduciary_term_block();

DROP TRIGGER IF EXISTS trg_enforce_fiduciary_blog_articles ON public.blog_articles;
CREATE TRIGGER trg_enforce_fiduciary_blog_articles
BEFORE INSERT OR UPDATE ON public.blog_articles
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiduciary_term_block();

DROP TRIGGER IF EXISTS trg_enforce_fiduciary_qa_pages ON public.qa_pages;
CREATE TRIGGER trg_enforce_fiduciary_qa_pages
BEFORE INSERT OR UPDATE ON public.qa_pages
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiduciary_term_block();

DROP TRIGGER IF EXISTS trg_enforce_fiduciary_location_pages ON public.location_pages;
CREATE TRIGGER trg_enforce_fiduciary_location_pages
BEFORE INSERT OR UPDATE ON public.location_pages
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiduciary_term_block();

DROP TRIGGER IF EXISTS trg_enforce_fiduciary_comparison_pages ON public.comparison_pages;
CREATE TRIGGER trg_enforce_fiduciary_comparison_pages
BEFORE INSERT OR UPDATE ON public.comparison_pages
FOR EACH ROW EXECUTE FUNCTION public.enforce_fiduciary_term_block();
