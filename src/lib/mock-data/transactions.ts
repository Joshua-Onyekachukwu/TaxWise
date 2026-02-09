export interface Transaction {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  status: "deductible" | "personal" | "review";
}

export const mockTransactions: Transaction[] = [
  // 2024 Data
  { id: "TX-24-001", date: "2024-01-15", description: "Client Payment - Project A", amount: 150000, category: "Income", type: "income", status: "deductible" },
  { id: "TX-24-002", date: "2024-02-10", description: "Office Rent", amount: 450000, category: "Rent", type: "expense", status: "deductible" },
  { id: "TX-24-003", date: "2024-03-05", description: "Internet Subscription", amount: 25000, category: "Utilities", type: "expense", status: "deductible" },
  
  // 2025 Data
  { id: "TX-25-001", date: "2025-05-20", description: "Freelance Work", amount: 200000, category: "Income", type: "income", status: "deductible" },
  { id: "TX-25-002", date: "2025-06-12", description: "Laptop Purchase", amount: 600000, category: "Equipment", type: "expense", status: "deductible" },
  
  // 2026 Data (Current)
  { id: "TX-26-001", date: "2026-01-05", description: "Consulting Fee", amount: 350000, category: "Income", type: "income", status: "deductible" },
  { id: "TX-26-002", date: "2026-01-10", description: "Uber Ride", amount: 4500, category: "Transport", type: "expense", status: "deductible" },
  { id: "TX-26-003", date: "2026-01-12", description: "Chicken Republic", amount: 3200, category: "Food", type: "expense", status: "personal" },
  { id: "TX-26-004", date: "2026-01-15", description: "Design Software Sub", amount: 15000, category: "Software", type: "expense", status: "deductible" },
  { id: "TX-26-005", date: "2026-01-20", description: "Client Lunch", amount: 12500, category: "Meals", type: "expense", status: "review" },
];

export const getFinancialSummary = (year: number) => {
  const yearTransactions = mockTransactions.filter(t => t.date.startsWith(year.toString()));
  
  const income = yearTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = yearTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const deductibles = yearTransactions
    .filter(t => t.status === "deductible" && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Simplified tax calculation (e.g., 20% flat on taxable income)
  const taxableIncome = Math.max(0, income - deductibles);
  const estimatedTax = taxableIncome * 0.20;

  return {
    income,
    expenses,
    deductibles,
    estimatedTax,
    taxSaved: deductibles * 0.20 // Estimated savings from deductibles
  };
};
