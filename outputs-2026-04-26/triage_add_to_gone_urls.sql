-- GSC triage 2026-04-26 (corrected after manual review).
-- Skipped /es and /en/glossary (hub URLs with trailing-slash mismatch — false positives).

INSERT INTO public.gone_urls (url_path, reason, marked_gone_at) VALUES
  ('/en/blog/costadelsol/best-neighborhoods', 'gsc-soft-404-2026-04-26-delsol-leftover', NOW()),
  ('/es/qa/qu-pasos-prcticos-mitigan-el-dficit-de-ahorro-process-es-b1e3dfdd', 'gsc-soft-404-2026-04-26-retired-qa', NOW())
ON CONFLICT (url_path) DO NOTHING;
