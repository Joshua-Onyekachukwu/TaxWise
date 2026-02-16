import { NormalizedTransaction } from '../csv-adapters/types';

// Polyfills for pdf-parse dependencies to avoid build errors in Node.js
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.Path2D === 'undefined') {
    // @ts-ignore
    global.Path2D = class Path2D {};
}
if (typeof global.ImageData === 'undefined') {
    // @ts-ignore
    global.ImageData = class ImageData {};
}

// @ts-ignore
const pdf = require('pdf-parse');

export class PdfParserService {
    
    /**
     * Parse a PDF buffer into normalized transactions.
     * Uses a multi-strategy approach:
     * 1. Text-based Regex extraction (fast, low cost)
     * 2. AI-based extraction (fallback, higher cost) - *To be implemented*
     */
    async parse(buffer: Buffer): Promise<NormalizedTransaction[]> {
        try {
            const data = await pdf(buffer);
            const text = data.text;

            // Strategy 1: Regex Extraction
            const transactions = this.parseWithRegex(text);

            if (transactions.length > 0) {
                return transactions;
            }

            // Strategy 2: AI Extraction (Placeholder)
            // if (process.env.OPENAI_API_KEY) {
            //    return this.parseWithAI(text);
            // }

            return [];
        } catch (error: any) {
            console.error("PDF Parsing failed:", error);
            // Log the actual error for debugging
            throw new Error(`Failed to parse PDF file: ${error.message || "Unknown error"}`);
        }
    }

    /**
     * Attempts to extract transactions using common bank statement regex patterns.
     * Supports formats like:
     * DD-MMM-YYYY Description Debit Credit Balance
     * DD/MM/YYYY Description Amount (Dr/Cr)
     */
    private parseWithRegex(text: string): NormalizedTransaction[] {
        const transactions: NormalizedTransaction[] = [];
        const lines = text.split('\n');

        // Regex Patterns
        // 1. Date: DD/MM/YYYY or DD-MMM-YYYY or YYYY-MM-DD
        const dateRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{2}\s[A-Za-z]{3}\s\d{4})/;
        
        // 2. Amount: Numbers with commas, optional decimals, optional negative sign
        // We look for the last 2-3 numbers in a line (Debit, Credit, Balance usually)
        const amountRegex = /([\d,]+\.\d{2})|([\d,]+)/g;

        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (!dateMatch) continue;

            const dateStr = dateMatch[0];
            const date = this.normalizeDate(dateStr);
            if (!date) continue;

            // Extract all numbers that look like amounts
            const amounts = line.match(amountRegex);
            if (!amounts || amounts.length < 1) continue;

            // Heuristic:
            // If 3 amounts: Debit, Credit, Balance
            // If 2 amounts: Amount, Balance (need to determine Dr/Cr from context or sign)
            // If 1 amount: Amount (ambiguous)

            // Let's assume the line looks like: Date Description ... Amounts
            // We strip the date from the line to get the rest
            const restOfLine = line.replace(dateStr, '').trim();
            
            // Clean amounts from the string to get description (roughly)
            let description = restOfLine;
            for (const amt of amounts) {
                description = description.replace(amt, '');
            }
            description = description.replace(/Cr|Dr/gi, '').trim(); // Remove Dr/Cr markers
            description = description.replace(/[^\w\s\-\.]/g, ''); // Remove special chars

            let amount = 0;
            let type: 'income' | 'expense' = 'expense';

            // Clean amounts to numbers
            const numericAmounts = amounts.map(a => parseFloat(a.replace(/,/g, '')));

            if (numericAmounts.length >= 2) {
                // Assumption: [Debit, Credit, Balance] or [Amount, Balance]
                // Check for explicit Dr/Cr in text
                const isCredit = /Cr|Credit/i.test(line);
                const isDebit = /Dr|Debit/i.test(line);

                if (isCredit) {
                    type = 'income';
                    amount = numericAmounts[0];
                } else if (isDebit) {
                    type = 'expense';
                    amount = numericAmounts[0];
                } else {
                    // Fallback: If 3 numbers, usually Debit, Credit, Balance
                    if (numericAmounts.length >= 3) {
                         // Check which one is non-zero?
                         // Usually Debit and Credit are mutually exclusive columns.
                         // But in text, they might be spaced.
                         // This is tricky without column alignment.
                         // Let's take the first number as Amount for now.
                         amount = numericAmounts[0];
                    } else {
                        amount = numericAmounts[0];
                    }
                }
            } else {
                amount = numericAmounts[0];
            }

            // Filter out obviously wrong amounts (e.g. line numbers)
            if (amount === 0 || isNaN(amount)) continue;

            transactions.push({
                date,
                description,
                amount,
                type,
                currency: 'NGN',
                raw_row: line
            });
        }

        return transactions;
    }

    private normalizeDate(dateStr: string): string | null {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return null;
            return d.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }
}
