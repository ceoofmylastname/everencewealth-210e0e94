UPDATE public.cluster_generations
SET status = 'failed',
    error = 'Worker shutdown mid-chunk: chunk handler returned response before EdgeRuntime.waitUntil could keep background fetches alive. Fixed in next deploy.',
    updated_at = NOW()
WHERE id = '738ff4bd-31f2-4b36-b2a0-6653a39a9d5c';