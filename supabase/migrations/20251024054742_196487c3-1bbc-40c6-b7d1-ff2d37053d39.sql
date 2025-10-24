-- Add missing columns to dim_aum table for AUM tracking
ALTER TABLE public.dim_aum
ADD COLUMN IF NOT EXISTS total_contribution numeric,
ADD COLUMN IF NOT EXISTS contribution_growth numeric,
ADD COLUMN IF NOT EXISTS payout numeric,
ADD COLUMN IF NOT EXISTS payout_growth numeric,
ADD COLUMN IF NOT EXISTS rate_of_return numeric,
ADD COLUMN IF NOT EXISTS vat_fee numeric;

-- Add a column to distinguish between current and target AUM records
ALTER TABLE public.dim_aum
ADD COLUMN IF NOT EXISTS aum_type text DEFAULT 'current' CHECK (aum_type IN ('current', 'target'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_aum_type_date ON public.dim_aum(aum_type, date_id);
CREATE INDEX IF NOT EXISTS idx_aum_fund_scenario ON public.dim_aum(fund_id, scenario_id);