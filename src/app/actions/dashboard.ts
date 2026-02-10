'use server';

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
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

  // 1. Fetch Transactions directly for aggregation (Source of Truth)
  // relying on cached upload_summaries causes sync issues.
  // We will re-aggregate on the fly for the dashboard to ensure consistency.
  
  const { data: allTransactions } = await supabase
    .from("transactions")
    .select("amount, type, is_deductible, status, date, categories(name)")
    .eq("user_id", user.id);

  if (!allTransactions || allTransactions.length === 0) {
      return {
          hasData: false,
          stats: { totalIncome: 0, totalExpenses: 0, deductibleTotal: 0, estTaxSaved: 0 },
          deductibleSeries: [0, 0, 0],
          recentTransactions: [],
          spendingOverview: [],
          incomeVsExpense: []
      };
  }

  // Aggregate Stats Live
  let totalIncome = 0;
  let totalExpenses = 0;
  let deductibleTotal = 0;
  
  let deductibleCount = 0;
  let personalCount = 0;
  let reviewCount = 0;

  const categoryMap: Record<string, number> = {};
  const monthlyMap: Record<string, { income: number, expense: number }> = {};

  allTransactions.forEach(tx => {
      const amt = Number(tx.amount);
      const date = new Date(tx.date);
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().substr(-2)}`;

      // Income/Expense
      if (tx.type === 'income') {
          totalIncome += amt;
          
          if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
          monthlyMap[monthKey].income += amt;

      } else {
          // Expense
          totalExpenses += amt;
          
          if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 };
          monthlyMap[monthKey].expense += amt;

          // Deductible
          if (tx.is_deductible) {
              deductibleTotal += amt;
          }

          // Category
          // @ts-ignore
          const catName = tx.categories?.name || 'Uncategorized';
          categoryMap[catName] = (categoryMap[catName] || 0) + amt;
      }

      // Status Counts
      if (tx.status === 'pending_review' || tx.status === 'processing') {
          reviewCount++;
      } else if (tx.is_deductible) {
          deductibleCount++;
      } else {
          personalCount++;
      }
  });

  const estTaxSaved = deductibleTotal * 0.15;

  const totalTxs = deductibleCount + personalCount + reviewCount;
  const deductibleSeries = totalTxs > 0 ? [
      Math.round((deductibleCount / totalTxs) * 100),
      Math.round((personalCount / totalTxs) * 100),
      Math.round((reviewCount / totalTxs) * 100)
  ] : [0, 0, 0];

  // Spending Overview
  const spendingOverview = Object.entries(categoryMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Income vs Expense
  const incomeVsExpense = Object.entries(monthlyMap)
    .map(([date, data]) => ({ date, ...data }))
    // Sort by actual date logic (Month Year)
    .sort((a, b) => {
        const dateA = new Date(`01 ${a.date}`);
        const dateB = new Date(`01 ${b.date}`);
        return dateA.getTime() - dateB.getTime();
    });

  // Fetch Recent Transactions separately to keep logic clean (or use filtered list if we want)
  // Let's fetch strict last 5
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("id, date, description, amount, type, status, is_deductible, categories(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  return {
    hasData: true,
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
