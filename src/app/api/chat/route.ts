import { createClient } from "@/lib/supabase/server";
import { streamText, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NIGERIA_TAX_LAW_CONTEXT, TAX_CONSTANTS } from "@/lib/tax-context/nigeria_finance_act_2023";
import { TaxCalculator } from "@/lib/tax-context/calculator";

// Set max duration for AI responses
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const supabase = await createClient();

  // 1. Get User Context (Income/Expense Data)
  const { data: { user } } = await supabase.auth.getUser();
  let userContext = "No financial data uploaded yet.";

  if (user) {
    // Try to get the latest upload summary (Faster & Richer Context)
    const { data: latestUpload } = await supabase
      .from('uploads')
      .select(`
        created_at,
        upload_summaries (
          income_total,
          expense_total,
          net_total,
          by_category,
          by_month,
          top_merchants,
          largest_transactions
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestUpload && latestUpload.upload_summaries && latestUpload.upload_summaries[0]) {
        const summary = latestUpload.upload_summaries[0];
        
        // Use summary data for context
        const income = Number(summary.income_total) || 0;
        // Estimate deductibles from summary if possible, otherwise fetch from transactions
        // Since summary doesn't explicitly store "deductible_total", we might still need a quick transaction query
        // Or we can rely on category breakdown if we knew which categories are deductible.
        // For accuracy, let's do a quick aggregate on transactions for the deductible part, 
        // but use summary for everything else (merchants, trends).
        
        const { data: deductibleAgg } = await supabase
            .from("transactions")
            .select("amount")
            .eq("user_id", user.id)
            .eq("is_deductible", true);
            
        const deductibles = deductibleAgg ? deductibleAgg.reduce((sum, t) => sum + Number(t.amount), 0) : 0;
        
        const taxResult = TaxCalculator.calculate(income, deductibles);

        userContext = `
        User Financial Snapshot (Latest Upload: ${new Date(latestUpload.created_at).toLocaleDateString()}):
        - Total Income: ₦${income.toLocaleString()}
        - Total Expenses: ₦${Number(summary.expense_total).toLocaleString()}
        - Net Income: ₦${Number(summary.net_total).toLocaleString()}
        - Deductible Expenses: ₦${deductibles.toLocaleString()} (Approx)
        - Estimated Tax Liability: ₦${taxResult.taxPayable.toLocaleString()}
        - Effective Tax Rate: ${(taxResult.effectiveRate * 100).toFixed(1)}%
        
        Top Merchants:
        ${JSON.stringify(summary.top_merchants).slice(0, 500)}
        
        Category Breakdown:
        ${JSON.stringify(summary.by_category).slice(0, 1000)}
        `;
    } else {
        // Fallback to raw transaction aggregation if no summary exists
        const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, type, is_deductible")
            .eq("user_id", user.id);
        
        if (transactions && transactions.length > 0) {
            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
            const deductibles = transactions.filter(t => t.is_deductible).reduce((sum, t) => sum + Number(t.amount), 0);
            
            const taxResult = TaxCalculator.calculate(income, deductibles);
            
            userContext = `
            User Financial Data (Live Aggregation):
            - Total Income: ₦${income.toLocaleString()}
            - Total Expenses: ₦${expenses.toLocaleString()}
            - Deductible Expenses: ₦${deductibles.toLocaleString()}
            - Estimated Tax: ₦${taxResult.taxPayable.toLocaleString()}
            `;
        }
    }
  }

  // 2. Construct System Prompt (Financial Detective Persona)
  const systemPrompt = `
    You are the "Financial Detective", an intelligent AI partner for Taxwise users.
    Your role is to uncover hidden tax opportunities, explain anomalies, and optimize the user's tax situation.
    
    ROLE DEFINITION:
    - You are NOT just a reporter. Do not just repeat the numbers provided below unless analyzing them.
    - You ARE an investigator. Look for patterns, missing deductions, and high expenses.
    - You are a Nigerian Tax Expert. Use the provided "Finance Act 2023" context.

    YOUR KNOWLEDGE BASE (NIGERIA TAX LAW):
    ${NIGERIA_TAX_LAW_CONTEXT}

    USER FINANCIAL CONTEXT:
    ${userContext}

    INTERACTION GUIDELINES:
    1. **Data-Backed Only**: Never hallucinate numbers. If you cite a figure, it must come from the context above.
    2. **Structure**: 
       - Start with a direct answer or summary.
       - Provide analysis ("I noticed...").
       - End with an actionable recommendation or a question to the user.
    3. **Tone**: Professional, inquisitive, and helpful. "Let's dig into this."
    4. **Safety**: 
       - If the user asks about tax evasion, firmly refuse and explain the difference between avoidance (legal) and evasion (illegal).
       - Always include this disclaimer for specific advice: "Disclaimer: This is for informational purposes. Consult a tax professional for filing."

    EXAMPLE RESPONSES:
    - "I notice your transport expenses (₦340k) are high. This could indicate business travel deductions you're missing."
    - "Based on your income of ₦2.5M, contributing ₦250k to a voluntary pension could save you ~₦75k in taxes."
  `;

  // 3. Stream Response
  const result = streamText({
    model: openai("gpt-4o-mini"), // Cost-effective model
    system: systemPrompt,
    messages: messages,
  });

  return result.toTextStreamResponse();
}
