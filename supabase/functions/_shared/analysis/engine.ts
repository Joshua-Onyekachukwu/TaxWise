import { DEFAULT_CATEGORIES, KEYWORD_RULES } from "./constants";

export class AnalysisEngine {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async ensureCategories(userId: string) {
    // 1. Check existing categories
    const { data: existing } = await this.supabase
      .from("categories")
      .select("name")
      .eq("user_id", userId);

    const existingNames = new Set(existing?.map((c: any) => c.name));

    // 2. Filter missing defaults
    const toInsert = DEFAULT_CATEGORIES
      .filter(c => !existingNames.has(c.name))
      .map(c => ({
        user_id: userId,
        name: c.name,
        type: c.type,
        is_deductible: (c as any).is_deductible || false,
        is_system_default: true
      }));

    if (toInsert.length > 0) {
      const { error } = await this.supabase.from("categories").insert(toInsert);
      if (error) console.error("Failed to seed categories:", error);
    }
  }

  async runAnalysis(analysisSessionId: string, userId: string) {
    // 1. Ensure categories exist
    await this.ensureCategories(userId);

    // 2. Fetch all categories for mapping
    const { data: categories } = await this.supabase
      .from("categories")
      .select("id, name, type, is_deductible") 
      .eq("user_id", userId);
    
    const categoryMap = new Map(categories?.map((c: any) => [c.name, c.id]));
    const categoryNames = categories?.map((c: any) => c.name) || [];

    // 3. Fetch uploads for the session
    const { data: uploads } = await this.supabase
      .from('uploads')
      .select('id')
      .eq('analysis_session_id', analysisSessionId);

    if (!uploads || uploads.length === 0) return { count: 0 };

    const uploadIds = uploads.map((u: { id: string }) => u.id);

    // 4. Fetch pending transactions for all uploads in the session
    const { data: transactions } = await this.supabase
      .from("transactions")
      .select("id, description, date, amount, currency, type")
      .in("upload_id", uploadIds)
      .eq("status", "pending_review");

    if (!transactions || transactions.length === 0) {
      await this.generateSummary(analysisSessionId, uploadIds);
      return { count: 0 };
    }

    // ... (rest of the analysis logic will be added back here)
    await this.generateSummary(analysisSessionId, uploadIds);

    return { count: transactions.length };
  }


  async generateSummary(analysisSessionId: string, uploadIds: string[]) {
    // Fetch all transactions for this session
    const { data: transactions } = await this.supabase
      .from("transactions")
      .select(`
        amount,
        type,
        date,
        description,
        is_deductible,
        category_id,
        categories (name)
      `)
      .in("upload_id", uploadIds);

    if (!transactions || transactions.length === 0) return;

    let incomeTotal = 0;
    let expenseTotal = 0;
    let deductibleTotal = 0;
    let uncategorizedCount = 0;
    let duplicateCount = 0;
    const txHashes = new Set<string>();
    
    const byCategory: Record<string, { amount: number, percent: number }> = {};
    const byMonth: Record<string, { income: number, expense: number }> = {};
    const merchantMap: Record<string, { amount: number, count: number }> = {};

    // 1. Aggregation Loop
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const categoryName = tx.categories?.name || 'Uncategorized';
      
      // Duplicate Check
      const txHash = `${tx.date}-${amount}-${tx.description}-${tx.type}`;
      if (txHashes.has(txHash)) {
          duplicateCount++;
      } else {
          txHashes.add(txHash);
      }
      
      if (categoryName === 'Uncategorized') uncategorizedCount++;

      // Income vs Expense
      if (tx.type === 'income') {
        incomeTotal += amount;
      } else {
        expenseTotal += amount;
        if (tx.is_deductible) {
            deductibleTotal += amount;
        }
      }

      // By Category (Expenses Only typically, or both? Let's do both but usually charts are expense breakdown)
      // Let's do breakdown by Type+Category? Or just Category. 
      // Usually "Spending Breakdown" implies expenses.
      if (tx.type === 'expense') {
          if (!byCategory[categoryName]) byCategory[categoryName] = { amount: 0, percent: 0 };
          byCategory[categoryName].amount += amount;
      }

      // By Month
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0 };
      if (tx.type === 'income') byMonth[month].income += amount;
      else byMonth[month].expense += amount;

      // Top Merchants (Simple heuristics on description)
      const merchant = tx.description.trim();
      if (!merchantMap[merchant]) merchantMap[merchant] = { amount: 0, count: 0 };
      merchantMap[merchant].amount += amount;
      merchantMap[merchant].count += 1;
    }

    // 2. Post-process
    const netTotal = incomeTotal - expenseTotal;
    const taxableIncome = Math.max(0, incomeTotal - deductibleTotal);
    // Simplified Tax Estimation (e.g., 15% flat for MVP)
    const estimatedTax = taxableIncome * 0.15;

    // Calculate percentages
    if (expenseTotal > 0) {
        for (const cat in byCategory) {
            byCategory[cat].percent = Number(((byCategory[cat].amount / expenseTotal) * 100).toFixed(1));
        }
    }

    // Top Merchants (Sort and slice)
    const topMerchants = Object.entries(merchantMap)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // Largest Transactions
    const sortedTxs = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount));
    const largestTransactions = {
        income: sortedTxs.filter(t => t.type === 'income').slice(0, 5),
        expense: sortedTxs.filter(t => t.type === 'expense').slice(0, 5)
    };

    // 3. Insert/Update Summary
    const summaryData = {
        analysis_session_id: analysisSessionId,
        income_total: incomeTotal,
        expense_total: expenseTotal,
        net_total: netTotal,
        deductible_total: deductibleTotal,
        taxable_income: taxableIncome,
        estimated_tax: estimatedTax,
        by_category: byCategory,
        by_month: byMonth,
        top_merchants: topMerchants,
        largest_transactions: largestTransactions,
        uncategorized_count: uncategorizedCount,
        quality_flags: {
            possible_duplicates: duplicateCount,
            has_uncategorized: uncategorizedCount > 0
        }
    };

    // Upsert workaround
    const { data: existingSummary } = await this.supabase
        .from("upload_summaries")
        .select("id")
        .eq("analysis_session_id", analysisSessionId)
        .maybeSingle();

    if (existingSummary) {
        const { error } = await this.supabase
            .from("upload_summaries")
            .update(summaryData)
            .eq("id", existingSummary.id);
         if (error) console.error("Failed to update upload summary:", error);
    } else {
        const { error } = await this.supabase
            .from("upload_summaries")
            .insert(summaryData);
         if (error) console.error("Failed to insert upload summary:", error);
    }
  }
}