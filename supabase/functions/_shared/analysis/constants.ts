export const DEFAULT_CATEGORIES = [
  // Income
  { name: "Salary", type: "income" },
  { name: "Freelance", type: "income" },
  { name: "Investments", type: "income" },
  
  // Expenses - Deductible (Potential)
  { name: "Internet & Utilities", type: "expense", is_deductible: true },
  { name: "Software & Subscriptions", type: "expense", is_deductible: true },
  { name: "Office Supplies", type: "expense", is_deductible: true },
  { name: "Rent (Office)", type: "expense", is_deductible: true },
  { name: "Professional Fees", type: "expense", is_deductible: true },
  { name: "Transport (Business)", type: "expense", is_deductible: true },
  { name: "Education & Training", type: "expense", is_deductible: true },
  
  // Expenses - Personal (Non-Deductible)
  { name: "Groceries", type: "expense", is_deductible: false },
  { name: "Entertainment", type: "expense", is_deductible: false },
  { name: "Dining Out", type: "expense", is_deductible: false },
  { name: "Rent (Home)", type: "expense", is_deductible: false },
  { name: "Personal Care", type: "expense", is_deductible: false },
  { name: "Charity", type: "expense", is_deductible: false }, // Specific rules apply
];

export const KEYWORD_RULES = [
  { keywords: ["upwork", "fiverr", "freelance", "consulting", "contract", "salary"], category: "Freelance", is_deductible: false }, // Income isn't deductible
  { keywords: ["mtn", "airtel", "glo", "9mobile", "spectranet", "starlink", "mainone", "ipnx", "electricity", "ekedc", "ikedc"], category: "Internet & Utilities", is_deductible: true },
  { keywords: ["zoom", "google", "aws", "digitalocean", "vercel", "heroku", "adobe", "jetbrains", "github", "linkedin", "slack"], category: "Software & Subscriptions", is_deductible: true },
  { keywords: ["uber", "bolt", "indriver", "taxify", "fuel", "total", "oando", "flight", "air peace", "ibom air"], category: "Transport (Business)", is_deductible: true },
  { keywords: ["shoprite", "spar", "market", "food", "kitchen"], category: "Groceries", is_deductible: false },
  { keywords: ["netflix", "dstv", "showmax", "cinema", "spotify", "apple music"], category: "Entertainment", is_deductible: false },
  { keywords: ["pizza", "chicken", "burger", "restaurant", "buka", "kitchen", "lounge"], category: "Dining Out", is_deductible: false },
  { keywords: ["udemy", "coursera", "pluralsight", "course", "training", "workshop"], category: "Education & Training", is_deductible: true },
  { keywords: ["ican", "nba", "membership", "legal", "audit", "accounting"], category: "Professional Fees", is_deductible: true },
];
