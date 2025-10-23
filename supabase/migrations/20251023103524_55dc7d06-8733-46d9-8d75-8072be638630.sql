-- Create enum types
CREATE TYPE public.account_category AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE public.financial_statement AS ENUM ('balance_sheet', 'income_statement', 'cash_flow', 'statement_of_changes_in_equity');
CREATE TYPE public.transaction_type AS ENUM ('actual', 'budget', 'forecast', 'adjustment');
CREATE TYPE public.scenario_type AS ENUM ('actual', 'budget', 'forecast', 'revised_budget', 'what_if');
CREATE TYPE public.budget_type AS ENUM ('original', 'revised', 'supplementary');
CREATE TYPE public.fund_category AS ENUM ('rsa_i', 'rsa_ii', 'rsa_iii', 'rsa_iv', 'micro_pension', 'approved_existing_scheme');
CREATE TYPE public.risk_profile AS ENUM ('conservative', 'moderate', 'aggressive');

-- 1. dim_region: Regional groupings
CREATE TABLE public.dim_region (
  region_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. dim_state: States in Nigeria
CREATE TABLE public.dim_state (
  state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_name TEXT NOT NULL UNIQUE,
  region_id UUID REFERENCES public.dim_region(region_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. dim_location: Business physical locations
CREATE TABLE public.dim_location (
  location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  state_id UUID REFERENCES public.dim_state(state_id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.dim_region(region_id) ON DELETE SET NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. dim_department: Organization cost centers
CREATE TABLE public.dim_department (
  department_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name TEXT NOT NULL UNIQUE,
  department_code TEXT UNIQUE,
  hod UUID, -- Will reference users after auth is set up
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. dim_fund: RSA Funds
CREATE TABLE public.dim_fund (
  fund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_name TEXT NOT NULL UNIQUE,
  fund_code TEXT UNIQUE,
  fund_category fund_category NOT NULL,
  risk_profile risk_profile NOT NULL,
  eligibility TEXT,
  variable_income_allocation DECIMAL(5,2), -- Percentage
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. dim_sector: Economic sectors
CREATE TABLE public.dim_sector (
  sector_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_name TEXT NOT NULL UNIQUE,
  sector_code TEXT UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. dim_account: Chart of accounts
CREATE TABLE public.dim_account (
  account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_category account_category NOT NULL,
  sub_category TEXT,
  financial_statement financial_statement NOT NULL,
  postable BOOLEAN NOT NULL DEFAULT true,
  parent_id UUID REFERENCES public.dim_account(account_id) ON DELETE SET NULL,
  level INTEGER NOT NULL DEFAULT 1,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. dim_date: Date dimension
CREATE TABLE public.dim_date (
  date_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  month_name TEXT NOT NULL,
  month_short_name TEXT NOT NULL,
  year_month TEXT NOT NULL,
  year_quarter TEXT NOT NULL,
  half_year INTEGER NOT NULL,
  year INTEGER NOT NULL,
  is_weekend BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. dim_scenario: Scenario management
CREATE TABLE public.dim_scenario (
  scenario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_code TEXT NOT NULL UNIQUE,
  scenario_name TEXT NOT NULL,
  scenario_type scenario_type NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_baseline BOOLEAN NOT NULL DEFAULT false,
  fiscal_year INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. dim_aum: Asset Under Management
CREATE TABLE public.dim_aum (
  aum_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id UUID REFERENCES public.dim_date(date_id) ON DELETE CASCADE NOT NULL,
  fund_id UUID REFERENCES public.dim_fund(fund_id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.dim_scenario(scenario_id) ON DELETE CASCADE NOT NULL,
  total_pin INTEGER,
  active_pin INTEGER,
  inactive_pin INTEGER,
  never_funded_pin INTEGER,
  new_pin INTEGER,
  total_rsa_balance DECIMAL(18,2),
  investment_returns DECIMAL(18,2),
  total_aum DECIMAL(18,2),
  new_pin_contribution DECIMAL(18,2),
  existing_pin_contribution DECIMAL(18,2),
  total_benefits_paid DECIMAL(18,2),
  retiree_contributors INTEGER,
  admin_fee DECIMAL(18,2),
  asset_fee DECIMAL(18,2),
  pfa_fee DECIMAL(18,2),
  pfc_fee DECIMAL(18,2),
  pencom_fee DECIMAL(18,2),
  net_cash_flow DECIMAL(18,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. fact_gl_transaction: General ledger transactions
CREATE TABLE public.fact_gl_transaction (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id UUID REFERENCES public.dim_date(date_id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.dim_account(account_id) ON DELETE CASCADE NOT NULL,
  fund_id UUID REFERENCES public.dim_fund(fund_id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.dim_department(department_id) ON DELETE SET NULL,
  scenario_id UUID REFERENCES public.dim_scenario(scenario_id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.dim_location(location_id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  transaction_subtype TEXT,
  debit_amount DECIMAL(18,2) DEFAULT 0,
  credit_amount DECIMAL(18,2) DEFAULT 0,
  net_amount DECIMAL(18,2) GENERATED ALWAYS AS (debit_amount - credit_amount) STORED,
  description TEXT,
  reference_number TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. fact_budget_forecast: Budget and forecast data
CREATE TABLE public.fact_budget_forecast (
  budget_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id UUID REFERENCES public.dim_date(date_id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.dim_account(account_id) ON DELETE CASCADE NOT NULL,
  fund_id UUID REFERENCES public.dim_fund(fund_id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.dim_department(department_id) ON DELETE SET NULL,
  scenario_id UUID REFERENCES public.dim_scenario(scenario_id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.dim_location(location_id) ON DELETE SET NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  budget_type budget_type NOT NULL,
  budget_amount DECIMAL(18,2) DEFAULT 0,
  forecast_amount DECIMAL(18,2) DEFAULT 0,
  actual_amount DECIMAL(18,2) DEFAULT 0,
  variance_budget DECIMAL(18,2) GENERATED ALWAYS AS (actual_amount - budget_amount) STORED,
  variance_forecast DECIMAL(18,2) GENERATED ALWAYS AS (actual_amount - forecast_amount) STORED,
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  approval_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dim_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_department ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_fund ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_sector ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_scenario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_aum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_gl_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_budget_forecast ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (authenticated users can read all setup tables)
CREATE POLICY "Authenticated users can view regions" ON public.dim_region FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view states" ON public.dim_state FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view locations" ON public.dim_location FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view departments" ON public.dim_department FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view funds" ON public.dim_fund FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view sectors" ON public.dim_sector FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view accounts" ON public.dim_account FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view dates" ON public.dim_date FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view scenarios" ON public.dim_scenario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view aum" ON public.dim_aum FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view transactions" ON public.fact_gl_transaction FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view budget forecast" ON public.fact_budget_forecast FOR SELECT TO authenticated USING (true);

-- Create indexes for performance
CREATE INDEX idx_state_region ON public.dim_state(region_id);
CREATE INDEX idx_location_state ON public.dim_location(state_id);
CREATE INDEX idx_location_region ON public.dim_location(region_id);
CREATE INDEX idx_account_parent ON public.dim_account(parent_id);
CREATE INDEX idx_gl_date ON public.fact_gl_transaction(date_id);
CREATE INDEX idx_gl_account ON public.fact_gl_transaction(account_id);
CREATE INDEX idx_gl_scenario ON public.fact_gl_transaction(scenario_id);
CREATE INDEX idx_budget_date ON public.fact_budget_forecast(date_id);
CREATE INDEX idx_budget_account ON public.fact_budget_forecast(account_id);
CREATE INDEX idx_budget_scenario ON public.fact_budget_forecast(scenario_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_dim_region_updated_at BEFORE UPDATE ON public.dim_region FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_state_updated_at BEFORE UPDATE ON public.dim_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_location_updated_at BEFORE UPDATE ON public.dim_location FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_department_updated_at BEFORE UPDATE ON public.dim_department FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_fund_updated_at BEFORE UPDATE ON public.dim_fund FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_sector_updated_at BEFORE UPDATE ON public.dim_sector FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_account_updated_at BEFORE UPDATE ON public.dim_account FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_scenario_updated_at BEFORE UPDATE ON public.dim_scenario FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dim_aum_updated_at BEFORE UPDATE ON public.dim_aum FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fact_gl_transaction_updated_at BEFORE UPDATE ON public.fact_gl_transaction FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fact_budget_forecast_updated_at BEFORE UPDATE ON public.fact_budget_forecast FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();