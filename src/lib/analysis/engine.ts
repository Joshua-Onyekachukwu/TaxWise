import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CATEGORIES, KEYWORD_RULES } from "./constants";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

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
        is_system_default: true
      }));

    if (toInsert.length > 0) {
      const { error } = await this.supabase.from("categories").insert(toInsert);
      if (error) console.error("Failed to seed categories:", error);
    }
  }

  async runAnalysis(uploadId: string, userId: string) {
    // 1. Ensure categories exist
    await this.ensureCategories(userId);

    // 2. Fetch all categories for mapping
    const { data: categories } = await this.supabase
      .from("categories")
      .select("id, name, type, is_deductible") 
      .eq("user_id", userId);
    
    const categoryMap = new Map(categories?.map((c: any) => [c.name, c.id]));
    const categoryNames = categories?.map((c: any) => c.name) || [];

    // 3. Fetch pending transactions
    // Only fetch ID, description, date, amount, type to minimize data
    const { data: transactions } = await this.supabase
      .from("transactions")
      .select("id, description, date, amount, currency, type")
      .eq("upload_id", uploadId)
      .eq("status", "pending_review");

    if (!transactions || transactions.length === 0) return { count: 0 };

    let updatedCount = 0;
    const transactionsToProcessAI: any[] = [];

    // 3.5 Fetch User Rules
    const { data: rules } = await this.supabase
        .from("rules")
        .select("*")
        .eq("user_id", userId);

    // 4. Process each transaction (Hybrid: User Rules -> System Rules -> AI)
    for (const tx of transactions) {
      const desc = tx.description.toLowerCase();
      let matchedCategory = null;
      let isDeductible = false;
      let method = 'rule';

      // A. User Rules (Highest Priority)
      if (rules) {
          for (const rule of rules) {
              if (rule.match_field === 'description' && desc.includes(rule.match_pattern.toLowerCase())) {
                  // Find category name from ID if stored, or if rule stores category ID directly
                  // Schema says: action_category_id
                  // We need to find the category object/ID.
                  if (rule.action_category_id) {
                      const cat = categories?.find((c: any) => c.id === rule.action_category_id);
                      if (cat) {
                          matchedCategory = cat.name;
                          // If rule specifies deductible, use it. Else inherit from category or default.
                          isDeductible = rule.action_deductible !== null ? rule.action_deductible : cat.is_deductible;
                          method = 'user_rule';
                          break;
                      }
                  }
              }
          }
      }

      // B. System Keyword Rules (Fallback)
      if (!matchedCategory) {
        for (const rule of KEYWORD_RULES) {
            if (rule.keywords.some(k => desc.includes(k))) {
            matchedCategory = rule.category;
            // Only mark deductible if it's an expense
            isDeductible = tx.type === 'expense' && rule.is_deductible;
            break;
            }
        }
      }

      if (matchedCategory) {
        // Fast path: Apply rule match
        const categoryId = categoryMap.get(matchedCategory);
        if (categoryId) {
          await this.supabase
            .from("transactions")
            .update({
              category_id: categoryId,
              is_deductible: isDeductible,
              deductible_confidence: 0.95, // Higher confidence for rules
              status: "classified"
            })
            .eq("id", tx.id);
          updatedCount++;
        }
      } else {
        // Queue for AI processing
        transactionsToProcessAI.push(tx);
      }
    }

    // 5. Batch Process AI (if configured)
    if (transactionsToProcessAI.length > 0 && process.env.OPENAI_API_KEY) {
      console.log(`Processing ${transactionsToProcessAI.length} transactions with AI...`);
      
      // Increased chunk size for efficiency, assuming GPT-4o-mini or similar cost-effective model
      // But kept safe to avoid timeouts. 
      // Optimization: We could use Promise.all for parallel chunks if Supabase connection pool allows.
      // Let's do parallel processing with concurrency limit.
      
      const chunkSize = 15;
      const chunks = [];
      for (let i = 0; i < transactionsToProcessAI.length; i += chunkSize) {
          chunks.push(transactionsToProcessAI.slice(i, i + chunkSize));
      }

      // Process chunks sequentially to avoid rate limits, but could be parallelized slightly.
      // Let's stick to sequential for safety in this version, but optimized prompt.
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkStartIndex = i * chunkSize;

        try {
          const prompt = `
            Analyze these financial transactions for a Nigerian freelancer.
            Map each to one of: ${categoryNames.join(', ')}.
            Determine if tax-deductible in Nigeria.
            
            Transactions:
            ${chunk.map((tx, idx) => `${idx}. ${tx.date} - ${tx.description} - ${tx.amount} ${tx.currency} (${tx.type})`).join('\n')}
          `;

          const { object } = await generateObject({
            model: openai('gpt-4o-mini'), // Use mini for speed/cost
            schema: z.object({
              classifications: z.array(z.object({
                index: z.number(),
                category: z.string(),
                is_deductible: z.boolean(),
                confidence: z.number(),
              }))
            }),
            prompt: prompt
          });

          // Prepare batch update
          // Supabase doesn't support bulk update with different values easily without upsert.
          // We'll use Promise.all for the updates in this chunk.
          
          const updatePromises = object.classifications.map(async (result) => {
             const tx = chunk[result.index]; // Relies on index matching 0..chunkSize
             if (tx) {
                 const categoryId = categoryMap.get(result.category);
                 if (categoryId) {
                     return this.supabase
                      .from("transactions")
                      .update({
                        category_id: categoryId,
                        is_deductible: result.is_deductible,
                        deductible_confidence: result.confidence,
                        status: "classified"
                      })
                      .eq("id", tx.id);
                 }
             }
             return Promise.resolve();
          });

          await Promise.all(updatePromises);
          updatedCount += updatePromises.length;

        } catch (error) {
          console.error("AI Processing Error for chunk:", error);
        }
      }
    } else if (transactionsToProcessAI.length > 0) {
        console.warn("Skipping AI processing: OPENAI_API_KEY not set");
    }

    // 6. Generate Summary
    await this.generateSummary(uploadId);

    return { count: updatedCount };
  }

  async generateSummary(uploadId: string) {
    // Fetch all transactions for this upload
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
      .eq("upload_id", uploadId);

    if (!transactions || transactions.length === 0) return;

    let incomeTotal = 0;
    let expenseTotal = 0;
    let uncategorizedCount = 0;
    
    const byCategory: Record<string, { amount: number, percent: number }> = {};
    const byMonth: Record<string, { income: number, expense: number }> = {};
    const merchantMap: Record<string, { amount: number, count: number }> = {};

    // 1. Aggregation Loop
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const categoryName = tx.categories?.name || 'Uncategorized';
      
      if (categoryName === 'Uncategorized') uncategorizedCount++;

      // Income vs Expense
      if (tx.type === 'income') {
        incomeTotal += amount;
      } else {
        expenseTotal += amount;
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
        upload_id: uploadId,
        income_total: incomeTotal,
        expense_total: expenseTotal,
        net_total: netTotal,
        by_category: byCategory,
        by_month: byMonth,
        top_merchants: topMerchants,
        largest_transactions: largestTransactions,
        uncategorized_count: uncategorizedCount
    };

    // Upsert
    const { error } = await this.supabase
        .from("upload_summaries")
        .upsert(summaryData, { onConflict: 'upload_id' });

    if (error) console.error("Failed to save upload summary:", error);
  }
}
