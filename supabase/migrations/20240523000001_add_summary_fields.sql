-- Add deductible_total and estimated_tax to upload_summaries
ALTER TABLE upload_summaries 
ADD COLUMN IF NOT EXISTS deductible_total NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS taxable_income NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_tax NUMERIC(12, 2) DEFAULT 0;
