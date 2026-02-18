-- Fix: Replace overly permissive public write policies on CMS tables with admin-only policies

-- =====================
-- blog_articles table
-- =====================
DROP POLICY IF EXISTS "Allow public insert to blog_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Allow public update to blog_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "Allow public delete from blog_articles" ON public.blog_articles;

CREATE POLICY "Admins can insert blog_articles"
  ON public.blog_articles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update blog_articles"
  ON public.blog_articles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog_articles"
  ON public.blog_articles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- =====================
-- authors table
-- =====================
DROP POLICY IF EXISTS "Allow public insert to authors" ON public.authors;
DROP POLICY IF EXISTS "Allow public update to authors" ON public.authors;
DROP POLICY IF EXISTS "Allow public delete from authors" ON public.authors;

CREATE POLICY "Admins can insert authors"
  ON public.authors FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update authors"
  ON public.authors FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete authors"
  ON public.authors FOR DELETE
  USING (public.is_admin(auth.uid()));

-- =====================
-- categories table
-- =====================
DROP POLICY IF EXISTS "Allow public insert to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public update to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public delete from categories" ON public.categories;

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (public.is_admin(auth.uid()));
