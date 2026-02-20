
-- ============================================================
-- 1. advisor_transactions
-- ============================================================
CREATE TABLE public.advisor_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT '',
  memo TEXT DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage own transactions" ON public.advisor_transactions
  FOR ALL USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()))
  WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- ============================================================
-- 2. advisor_debts
-- ============================================================
CREATE TABLE public.advisor_debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  apr NUMERIC NOT NULL DEFAULT 0,
  minimum_payment NUMERIC NOT NULL DEFAULT 0,
  target_payoff_date DATE,
  is_paid_off BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage own debts" ON public.advisor_debts
  FOR ALL USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()))
  WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- ============================================================
-- 3. advisor_accounts
-- ============================================================
CREATE TABLE public.advisor_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking',
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors manage own accounts" ON public.advisor_accounts
  FOR ALL USING (advisor_id = public.get_advisor_id_for_auth(auth.uid()))
  WITH CHECK (advisor_id = public.get_advisor_id_for_auth(auth.uid()));

-- Trigger for updated_at on accounts
CREATE TRIGGER update_advisor_accounts_updated_at
  BEFORE UPDATE ON public.advisor_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for transactions (useful for live dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_transactions;
