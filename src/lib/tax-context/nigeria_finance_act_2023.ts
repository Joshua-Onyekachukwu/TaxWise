// Nigerian Tax Law Context for AI (RAG)
// Based on Finance Act 2023 and PITA 2011

export const NIGERIA_TAX_LAW_CONTEXT = `
# Nigeria Personal Income Tax Guide (Finance Act 2023 / PITA 2011)

## 1. Key Principles
- **Residency:** Tax is payable to the State of residence (e.g., Lagos State Internal Revenue Service - LIRS).
- **Global Income:** Residents are taxed on global income, unless specific treaties apply.

## 2. Tax Exemptions & Deductions (Legal Optimization)
The following are NOT taxable or reduce taxable income:
- **Consolidated Relief Allowance (CRA):** The higher of ₦200,000 or 1% of Gross Income, PLUS 20% of Gross Income. This is the single biggest relief.
- **Pension Contributions:** Compulsory pension contributions (minimum 8% by employee) are fully tax-deductible.
- **National Housing Fund (NHF):** 2.5% of basic salary is deductible.
- **Life Assurance:** Premiums paid on life insurance policies for self/spouse are deductible.
- **Business Expenses (for Freelancers/Enterprises):** Expenses "wholly, exclusively, necessarily and reasonably" incurred in producing income are deductible.
    - Examples: Internet, Office Rent, Professional Fees, Software Subscriptions.
    - Non-Deductible: Personal food, clothing, family expenses.

## 3. Tax Rates (Graduated Scale)
After deducting reliefs (CRA, Pension, etc.), the remaining "Chargeable Income" is taxed as follows:
1. First ₦300,000 @ 7%
2. Next ₦300,000 @ 11%
3. Next ₦500,000 @ 15%
4. Next ₦500,000 @ 19%
5. Next ₦1,600,000 @ 21%
6. Above ₦3,200,000 @ 24%

*Minimum Tax:* If taxable income is nil or very low, Minimum Tax of 1% of Gross Income applies (for those earning >₦30,000/year).

## 4. Optimization Strategy (The "Loophole" Guide)
To legally minimize tax:
1. **Maximize CRA:** Ensure Gross Income is calculated correctly to get the full 20% relief.
2. **Voluntary Pension:** You can contribute more than the minimum 8% to reduce taxable income further (Additional Voluntary Contributions - AVC).
3. **Expense Tracking:** For freelancers, ensure EVERY business-related cost (Uber for meetings, data, power) is tracked.
`;

export const TAX_CONSTANTS = {
  currency: 'NGN',
  reliefs: {
    cra_fixed: 200000,
    cra_percent: 0.20,
    pension_rate: 0.08,
    nhf_rate: 0.025
  },
  bands: [
    { limit: 300000, rate: 0.07 },
    { limit: 300000, rate: 0.11 },
    { limit: 500000, rate: 0.15 },
    { limit: 500000, rate: 0.19 },
    { limit: 1600000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 }
  ]
};
