UPDATE public.cluster_generations
SET status = 'failed',
    error = 'Marked failed manually: Claude API hung at article 1 attempt 2 before timeout/heartbeat fix was deployed.',
    progress = jsonb_build_object(
      'last_heartbeat', 'manually_failed_pre_timeout_fix',
      'ts', now()::text,
      'message', 'Job was hung; cleared by maintenance migration.'
    ),
    updated_at = now()
WHERE id::text LIKE 'e7f8100a%'
  AND status = 'generating';