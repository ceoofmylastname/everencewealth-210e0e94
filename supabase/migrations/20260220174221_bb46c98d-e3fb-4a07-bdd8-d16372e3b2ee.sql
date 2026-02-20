
-- Create client_needs_analysis table
CREATE TABLE public.client_needs_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES public.portal_users(id),
  client_id UUID REFERENCES public.portal_users(id),

  -- Goals
  goal_retirement_age BOOLEAN DEFAULT false,
  goal_retirement_age_target INTEGER,
  goal_monthly_amount BOOLEAN DEFAULT false,
  goal_monthly_amount_target DECIMAL(10,2),
  goal_vacation BOOLEAN DEFAULT false,
  goal_home BOOLEAN DEFAULT false,
  goal_travel BOOLEAN DEFAULT false,
  goal_other_goals BOOLEAN DEFAULT false,
  goal_other_description TEXT,
  goal_education BOOLEAN DEFAULT false,
  goal_retire_parents BOOLEAN DEFAULT false,

  -- Risk Tolerance
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderately_conservative', 'moderate', 'moderately_aggressive', 'aggressive')),

  -- Applicant & Spouse
  applicant_name TEXT NOT NULL,
  spouse_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  applicant_dob DATE,
  spouse_dob DATE,
  applicant_smoking_status TEXT CHECK (applicant_smoking_status IN ('smoker', 'non_smoker')),
  spouse_smoking_status TEXT CHECK (spouse_smoking_status IN ('smoker', 'non_smoker')),

  -- Income
  combined_gross_income DECIMAL(10,2),
  combined_net_income DECIMAL(10,2),
  other_income DECIMAL(10,2),
  other_income_description TEXT,

  -- Expenses Non-Discretionary
  expense_mortgage_rent DECIMAL(10,2),
  expense_insurance DECIMAL(10,2),
  expense_utilities DECIMAL(10,2),
  expense_car_payment DECIMAL(10,2),
  expense_health_premiums DECIMAL(10,2),
  expense_debt_service DECIMAL(10,2),

  -- Expenses Discretionary
  expense_groceries DECIMAL(10,2),
  expense_dining_out DECIMAL(10,2),
  expense_child_care DECIMAL(10,2),
  expense_clothing DECIMAL(10,2),
  expense_gifts DECIMAL(10,2),
  expense_travel DECIMAL(10,2),
  expense_other DECIMAL(10,2),
  expense_other_description TEXT,

  -- Assets
  asset_home_value DECIMAL(12,2),
  asset_savings_cds DECIMAL(12,2),
  asset_investments DECIMAL(12,2),
  asset_retirement_accounts DECIMAL(12,2),
  asset_life_insurance_cv DECIMAL(12,2),
  asset_other DECIMAL(12,2),
  asset_other_description TEXT,

  -- Liabilities
  liability_mortgage DECIMAL(12,2),
  liability_car_loans DECIMAL(12,2),
  liability_credit_cards DECIMAL(12,2),
  liability_student_loans DECIMAL(12,2),
  liability_other DECIMAL(12,2),
  liability_other_description TEXT,

  -- Budget
  budget_available_400 BOOLEAN DEFAULT false,
  budget_available_800 BOOLEAN DEFAULT false,
  budget_available_1600 BOOLEAN DEFAULT false,
  budget_available_other DECIMAL(10,2),

  -- Calculated
  total_monthly_expenses DECIMAL(10,2),
  total_assets DECIMAL(12,2),
  total_liabilities DECIMAL(12,2),
  net_worth DECIMAL(12,2),
  monthly_surplus_deficit DECIMAL(10,2),
  debt_to_income_ratio DECIMAL(5,2),

  -- AI Analysis
  ai_recommendations JSONB,
  ai_insurance_gap JSONB,
  ai_retirement_projection JSONB,
  ai_risk_assessment JSONB,

  -- Collaboration
  advisor_notes TEXT,
  follow_up_tasks JSONB,
  next_review_date DATE,

  -- Signature
  client_signature TEXT,
  signature_date TIMESTAMPTZ,

  -- Metadata
  status TEXT CHECK (status IN ('draft', 'completed', 'reviewed', 'archived')) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.client_needs_analysis(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_cna_advisor ON public.client_needs_analysis(advisor_id);
CREATE INDEX idx_cna_client ON public.client_needs_analysis(client_id);
CREATE INDEX idx_cna_status ON public.client_needs_analysis(status);
CREATE INDEX idx_cna_created ON public.client_needs_analysis(created_at DESC);

-- RLS
ALTER TABLE public.client_needs_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisors can view own CNAs"
ON public.client_needs_analysis FOR SELECT
TO authenticated
USING (advisor_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Advisors can create CNAs"
ON public.client_needs_analysis FOR INSERT
TO authenticated
WITH CHECK (advisor_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Advisors can update own CNAs"
ON public.client_needs_analysis FOR UPDATE
TO authenticated
USING (advisor_id = public.get_portal_user_id(auth.uid()));

CREATE POLICY "Admins can view all CNAs"
ON public.client_needs_analysis FOR SELECT
TO authenticated
USING (public.is_portal_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_cna_updated_at
BEFORE UPDATE ON public.client_needs_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
