
-- Create advisor_sales table
CREATE TABLE public.advisor_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  product_type TEXT NOT NULL,
  premium_mode TEXT NOT NULL DEFAULT 'annual',
  monthly_premium NUMERIC,
  annual_premium NUMERIC NOT NULL,
  client_name TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create advisor_goals table
CREATE TABLE public.advisor_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advisor_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_goals ENABLE ROW LEVEL SECURITY;

-- advisor_sales: all advisors can SELECT (for leaderboard)
CREATE POLICY "All advisors can view sales for leaderboard"
ON public.advisor_sales FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advisors WHERE auth_user_id = auth.uid()
  )
);

-- advisor_sales: advisors can INSERT their own
CREATE POLICY "Advisors can insert own sales"
ON public.advisor_sales FOR INSERT TO authenticated
WITH CHECK (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

-- advisor_sales: advisors can UPDATE their own
CREATE POLICY "Advisors can update own sales"
ON public.advisor_sales FOR UPDATE TO authenticated
USING (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

-- advisor_sales: advisors can DELETE their own
CREATE POLICY "Advisors can delete own sales"
ON public.advisor_sales FOR DELETE TO authenticated
USING (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

-- advisor_goals: advisors manage their own goals only
CREATE POLICY "Advisors can view own goals"
ON public.advisor_goals FOR SELECT TO authenticated
USING (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

CREATE POLICY "Advisors can insert own goals"
ON public.advisor_goals FOR INSERT TO authenticated
WITH CHECK (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

CREATE POLICY "Advisors can update own goals"
ON public.advisor_goals FOR UPDATE TO authenticated
USING (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

CREATE POLICY "Advisors can delete own goals"
ON public.advisor_goals FOR DELETE TO authenticated
USING (
  advisor_id = public.get_my_advisor_id_from_portal(auth.uid())
);

-- Enable realtime for advisor_sales (leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_sales;
