'use server';

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(accountId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If running on server component, throwing error crashes the page.
    // Return empty state or redirect.
    return {
      hasData: false,
      stats: { totalIncome: 0, totalExpenses: 0, deductibleTotal: 0, estTaxSaved: 0 },
      deductibleSeries: [0, 0, 0],
      recentTransactions: [],
      spendingOverview: [],
      incomeVsExpense: []
    };
  }

  // 1. Fetch pre-computed summaries
  let summaryQuery = supabase
    .from("upload_summaries")
    .select("*, uploads!inner(account_id)")
    .eq("user_id", user.id);

  if (accountId) {
    summaryQuery = summaryQuery.eq("uploads.account_id", accountId);
  }

  const { data: summaries } = await summaryQuery;

  if (!summaries || summaries.length === 0) {
      return {
          hasData: false,
          stats: { totalIncome: 0, totalExpenses: 0, deductibleTotal: 0, estTaxSaved: 0 },
          deductibleSeries: [0, 0, 0],
          recentTransactions: [],
          spendingOverview: [],
          incomeVsExpense: []
      };
  }

  // Aggregate summaries
  const aggregatedSummary = summaries.reduce((acc, summary) => {
    acc.totalIncome += summary.income_total || 0;
    acc.totalExpenses += summary.expense_total || 0;
    acc.deductibleTotal += summary.deductible_total || 0;
    // ... aggregate other fields as needed
    return acc;
  }, { totalIncome: 0, totalExpenses: 0, deductibleTotal: 0 });

  const estTaxSaved = aggregatedSummary.deductibleTotal * 0.15;

  // NOTE: The following are simplified and may need more complex aggregation
  const deductibleSeries = summaries[0]?.by_category ? Object.values(summaries[0].by_category) as number[] : [0,0,0];
  const spendingOverview = summaries[0]?.top_merchants ? summaries[0].top_merchants as any[] : [];
  const incomeVsExpense = summaries[0]?.by_month ? Object.entries(summaries[0].by_month).map(([date, data]) => ({ date, ...(data as any) })) : [];

  const recentTransactions = summaries[0]?.largest_transactions ? [...(summaries[0].largest_transactions as any).income, ...(summaries[0].largest_transactions as any).expense] : [];

  return {
    hasData: true,
    stats: {
      totalIncome: aggregatedSummary.totalIncome,
      totalExpenses: aggregatedSummary.totalExpenses,
      deductibleTotal: aggregatedSummary.deductibleTotal,
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
