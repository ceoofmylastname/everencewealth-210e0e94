create table public.flagged_articles (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.blog_articles(id) on delete cascade,
  reason text not null,
  matched_pattern text,
  matched_excerpt text,
  cluster_generation_id uuid references public.cluster_generations(id) on delete set null,
  compliance_class text,
  status text not null default 'pending_review',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, reason)
);

create index idx_flagged_articles_status on public.flagged_articles(status);
create index idx_flagged_articles_article on public.flagged_articles(article_id);
create index idx_flagged_articles_cluster on public.flagged_articles(cluster_generation_id);

alter table public.flagged_articles enable row level security;

create policy "Admins can read flagged articles"
  on public.flagged_articles
  for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update flagged articles"
  on public.flagged_articles
  for update
  using (public.is_admin(auth.uid()));

create policy "Service role can insert flagged articles"
  on public.flagged_articles
  for insert
  with check (true);

create policy "Admins can delete flagged articles"
  on public.flagged_articles
  for delete
  using (public.is_admin(auth.uid()));

create trigger trg_flagged_articles_updated_at
  before update on public.flagged_articles
  for each row
  execute function public.update_updated_at_column();