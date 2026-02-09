'use server';

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch Upload Summaries (for Income/Expense totals)
  // We need to join with uploads to filter by user_id, but RLS should handle it if we select from view or correct table.
  // Actually, upload_summaries RLS says: "Users can view own upload summaries".
  // So we can just select * from upload_summaries.
  // Wait, RLS uses "EXISTS (SELECT 1 FROM uploads ...)" so yes, we can select directly.
  
  const { data: summaries } = await supabase
    .from("upload_summaries")
    .select("*");

  // 2. Fetch Deductible Expenses Total & Status Breakdown
  // Direct query on transactions is accurate.
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select("amount, is_deductible, status")
    .eq("user_id", user.id);

  let deductibleTotal = 0;
  let deductibleCount = 0;
  let personalCount = 0;
  let reviewCount = 0; // "pending_review" or similar

  if (allTransactions) {
      allTransactions.forEach(tx => {
          if (tx.is_deductible) {
              deductibleTotal += Number(tx.amount);
              deductibleCount++;
          } else {
              personalCount++;
          }
          if (tx.status === 'pending_review') {
              reviewCount++;
          }
      });
  }
  
  const totalCount = deductibleCount + personalCount;
  const deductibleStatus = {
      deductible: totalCount > 0 ? Math.round((deductibleCount / totalCount) * 100) : 0,
      personal: totalCount > 0 ? Math.round((personalCount / totalCount) * 100) : 0,
      review: totalCount > 0 ? Math.round((reviewCount / totalCount) * 100) : 0 // Review is overlapping status, but for chart we might want partitioning. 
      // Simplified: Just use is_deductible (Yes/No) and maybe a separate logic for "Uncategorized/Review".
      // Let's stick to the chart labels: "Deductible", "Personal", "Review".
      // If status is 'pending_review', count as Review. If classified and deductible, Deductible. Else Personal.
  };
  
  // Re-calculate based on priority
  deductibleCount = 0;
  personalCount = 0;
  reviewCount = 0;
  
  if (allTransactions) {
      allTransactions.forEach(tx => {
          if (tx.status === 'pending_review' || tx.status === 'processing') {
              reviewCount++;
          } else if (tx.is_deductible) {
              deductibleCount++;
          } else {
              personalCount++;
          }
      });
  }
  
  const totalTxs = deductibleCount + personalCount + reviewCount;
  const deductibleSeries = totalTxs > 0 ? [
      Math.round((deductibleCount / totalTxs) * 100),
      Math.round((personalCount / totalTxs) * 100),
      Math.round((reviewCount / totalTxs) * 100)
  ] : [0, 0, 0];

  // 3. Fetch Recent Transactions

  // 3. Fetch Recent Transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("id, date, description, amount, type, status, is_deductible, categories(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  // 4. Aggregate Stats
  let totalIncome = 0;
  let totalExpenses = 0;
  
  // Aggregate from summaries
  if (summaries) {
    summaries.forEach(s => {
      totalIncome += Number(s.income_total);
      totalExpenses += Number(s.expense_total);
    });
  }

  // If no summaries (e.g. old uploads before this feature), maybe fallback to transactions?
  // For Batch 1, assuming new uploads or re-analysis.
  // Actually, we should probably fallback if totals are 0 but transactions exist.
  // But let's keep it simple.

  // 5. Calculate "Est. Tax Saved" (Simplified: 15% of deductibles)
  const estTaxSaved = deductibleTotal * 0.15;

  // 6. Spending Overview (Category Breakdown)
  // We need to merge `by_category` from all summaries.
  const categoryMap: Record<string, number> = {};
  if (summaries) {
    summaries.forEach(s => {
      if (s.by_category) {
        // s.by_category is JSONB: { "Transport": { amount: 100, percent: 10 } }
        // We need to parse it if it's string, or access properties.
        // Supabase returns JSONB as object.
        const cats = s.by_category as Record<string, { amount: number }>;
        for (const [cat, data] of Object.entries(cats)) {
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(data.amount);
        }
      }
    });
  }

  // Convert to chart format
  const spendingOverview = Object.entries(categoryMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  // 7. Income vs Expenses (Monthly)
  // Merge `by_month`
  const monthlyMap: Record<string, { income: number, expense: number }> = {};
  if (summaries) {
    summaries.forEach(s => {
        if (s.by_month) {
            const months = s.by_month as Record<string, { income: number, expense: number }>;
            for (const [month, data] of Object.entries(months)) {
                if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
                monthlyMap[month].income += Number(data.income);
                monthlyMap[month].expense += Number(data.expense);
            }
        }
    });
  }

  const incomeVsExpense = Object.entries(monthlyMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Chronological

  return {
    hasData: (summaries && summaries.length > 0) || (recentTransactions && recentTransactions.length > 0),
    stats: {
      totalIncome,
      totalExpenses,
      deductibleTotal,
      estTaxSaved
    },
    deductibleSeries,
    recentTransactions: recentTransactions?.map((tx: any) => ({
      ...tx,
      categories: Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
    })) || [],
    spendingOverview,
    incomeVsExpense
  };
}
