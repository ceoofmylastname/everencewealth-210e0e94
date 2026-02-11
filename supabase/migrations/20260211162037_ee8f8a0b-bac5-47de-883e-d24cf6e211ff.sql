
-- Create has_apartments_access helper function
CREATE OR REPLACE FUNCTION public.has_apartments_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'apartments_editor')
  )
$$;

-- Update apartments_page_content policies
DROP POLICY IF EXISTS "Admins can manage apartments page content" ON public.apartments_page_content;
DROP POLICY IF EXISTS "Admins can insert apartments page content" ON public.apartments_page_content;
DROP POLICY IF EXISTS "Admins can update apartments page content" ON public.apartments_page_content;
DROP POLICY IF EXISTS "Admins can delete apartments page content" ON public.apartments_page_content;

CREATE POLICY "Apartments editors can select page content"
ON public.apartments_page_content FOR SELECT
TO authenticated
USING (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can insert page content"
ON public.apartments_page_content FOR INSERT
TO authenticated
WITH CHECK (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can update page content"
ON public.apartments_page_content FOR UPDATE
TO authenticated
USING (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can delete page content"
ON public.apartments_page_content FOR DELETE
TO authenticated
USING (public.has_apartments_access(auth.uid()));

-- Update apartments_properties policies
DROP POLICY IF EXISTS "Admins can manage apartments properties" ON public.apartments_properties;
DROP POLICY IF EXISTS "Admins can insert apartments properties" ON public.apartments_properties;
DROP POLICY IF EXISTS "Admins can update apartments properties" ON public.apartments_properties;
DROP POLICY IF EXISTS "Admins can delete apartments properties" ON public.apartments_properties;

CREATE POLICY "Apartments editors can select properties"
ON public.apartments_properties FOR SELECT
TO authenticated
USING (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can insert properties"
ON public.apartments_properties FOR INSERT
TO authenticated
WITH CHECK (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can update properties"
ON public.apartments_properties FOR UPDATE
TO authenticated
USING (public.has_apartments_access(auth.uid()));

CREATE POLICY "Apartments editors can delete properties"
ON public.apartments_properties FOR DELETE
TO authenticated
USING (public.has_apartments_access(auth.uid()));

-- Public access policies for landing page
DROP POLICY IF EXISTS "Public can view published apartments page content" ON public.apartments_page_content;
CREATE POLICY "Public can view published apartments page content"
ON public.apartments_page_content FOR SELECT
TO anon
USING (is_published = true);

DROP POLICY IF EXISTS "Public can view visible apartments properties" ON public.apartments_properties;
CREATE POLICY "Public can view visible apartments properties"
ON public.apartments_properties FOR SELECT
TO anon
USING (visible = true);
