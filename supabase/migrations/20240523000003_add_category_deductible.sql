-- Add is_deductible to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_deductible BOOLEAN DEFAULT FALSE;
