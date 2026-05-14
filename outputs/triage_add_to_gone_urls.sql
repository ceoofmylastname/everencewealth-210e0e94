-- GSC triage 2026-04-26.
-- Review outputs/triage_report.csv before running.
-- Adds rows to gone_urls so the PROMPT 17 catchall returns 410 instead of 404.
-- Schema verified: (url_path, reason, marked_gone_at). pattern_match defaults false.

INSERT INTO public.gone_urls (url_path, reason, marked_gone_at) VALUES
  ('/es/qa/qu-pasos-prcticos-mitigan-el-dficit-de-ahorro-process-es-b1e3dfdd', 'gsc-soft-404-2026-04-26', NOW())
ON CONFLICT (url_path) DO NOTHING;
