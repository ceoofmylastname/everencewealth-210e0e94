UPDATE public.blog_articles
SET detailed_content = REPLACE(
      REPLACE(detailed_content, '+1-415-555-0100', '+1-925-433-7724'),
      '"url": "https://everencewealth.com"',
      '"url": "https://www.everencewealth.com"'
    ),
    date_modified = now(),
    updated_at = now()
WHERE detailed_content LIKE '%415-555-0100%';