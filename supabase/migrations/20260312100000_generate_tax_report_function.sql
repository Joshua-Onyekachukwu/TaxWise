CREATE OR REPLACE FUNCTION generate_tax_report()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  report json;
BEGIN
  SELECT json_build_object(
    'totalIncome', COALESCE(SUM(credit), 0),
    'totalExpenses', COALESCE(SUM(debit), 0),
    'totalDeductibles', COALESCE(SUM(CASE WHEN is_deductible THEN debit ELSE 0 END), 0),
    'estimatedTaxSavings', COALESCE(SUM(CASE WHEN is_deductible THEN debit ELSE 0 END), 0) * 0.2 -- Assuming a 20% tax rate for estimation
  )
  INTO report
  FROM transactions
  WHERE user_id = auth.uid(); -- RLS will enforce this, but it's good practice to be explicit

  RETURN report;
END;
$$;
