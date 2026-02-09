import { TAX_CONSTANTS } from "./nigeria_finance_act_2023";

interface TaxResult {
  grossIncome: number;
  totalReliefs: number;
  taxableIncome: number;
  taxPayable: number;
  breakdown: {
    cra: number;
    pension: number;
    expenses: number;
  };
  effectiveRate: number;
}

export class TaxCalculator {
  static calculate(income: number, deductibleExpenses: number): TaxResult {
    // 1. Gross Income (Total Inflow)
    const grossIncome = income;

    // 2. Calculate Reliefs
    // CRA: Higher of 200k or 1% Gross + 20% Gross
    const craFixed = Math.max(TAX_CONSTANTS.reliefs.cra_fixed, grossIncome * 0.01);
    const craVariable = grossIncome * TAX_CONSTANTS.reliefs.cra_percent;
    const cra = craFixed + craVariable;

    // Pension (Assuming 8% of Gross - usually Basic+Housing+Transport, but using Gross for MVP simplicity)
    const pension = grossIncome * TAX_CONSTANTS.reliefs.pension_rate;

    const totalReliefs = cra + pension + deductibleExpenses;

    // 3. Chargeable Income
    let taxableIncome = Math.max(0, grossIncome - totalReliefs);
    
    // 4. Calculate Tax (Bands)
    let taxPayable = 0;
    let tempIncome = taxableIncome;

    for (const band of TAX_CONSTANTS.bands) {
      if (tempIncome <= 0) break;
      
      const taxableAmount = Math.min(tempIncome, band.limit);
      taxPayable += taxableAmount * band.rate;
      tempIncome -= taxableAmount;
    }

    // Minimum Tax Check (1% of Gross) - Simplified rule
    const minTax = grossIncome * 0.01;
    if (taxPayable < minTax && grossIncome > 300000) {
        // taxPayable = minTax; // PITA rules are complex here, keeping bands for now
    }

    return {
      grossIncome,
      totalReliefs,
      taxableIncome,
      taxPayable,
      breakdown: {
        cra,
        pension,
        expenses: deductibleExpenses
      },
      effectiveRate: (taxPayable / grossIncome) || 0
    };
  }
}
