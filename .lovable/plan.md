

## Problem

The `recruit_leads` and `recruit_settings` tables do not exist in the database. The `Recruit.tsx` page tries to insert into `recruit_leads`, and `Briefing.tsx` tries to read from `recruit_settings` — both fail with "table not found" errors. This also causes all the TypeScript build errors in `RecruitCRM.tsx` and `Briefing.tsx`.

## Fix

### 1. Create the missing database tables

**Migration: Create `recruit_leads` and `recruit_settings` tables**

```sql
CREATE TABLE public.recruit_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  audit_score INTEGER,
  video_watch_time INTEGER DEFAULT 0,
  audit_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.recruit_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public inserts for recruit_leads (anonymous form submissions)
ALTER TABLE public.recruit_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.recruit_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read leads" ON public.recruit_leads FOR SELECT USING (public.is_admin(auth.uid()));

-- Settings readable by anyone, writable by admins
ALTER TABLE public.recruit_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.recruit_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.recruit_settings FOR ALL USING (public.is_admin(auth.uid()));
```

### 2. Fix TypeScript errors in `RecruitCRM.tsx`

After the tables are created, the Supabase types will regenerate and the type errors will resolve. In the meantime, use `as any` casts on the supabase calls in `RecruitCRM.tsx` (same pattern already used in `Recruit.tsx`) to unblock the build.

### 3. Seed default briefing video URL

Insert a default row into `recruit_settings` so the briefing page loads the video correctly.

### Files changed
- `src/components/portal/admin/RecruitCRM.tsx` — add `as any` casts to fix build errors until types regenerate
- Database migration — create the two missing tables with RLS

