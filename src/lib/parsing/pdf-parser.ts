import { NormalizedTransaction } from '../csv-adapters/types';

// Polyfills for pdf-parse dependencies to avoid build errors in Node.js
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {};
}
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {};
}

// @ts-ignore
const pdfParseModule = require('pdf-parse/node');
// @ts-ignore
const pdfParse = pdfParseModule.default || pdfParseModule;

export class PdfParserService {
  /**
   * Parse a PDF buffer into normalized transactions.
   * Uses a multi-strategy approach:
   * 1. Text-based Regex extraction (fast, low cost)
   * 2. AI-based extraction (fallback, higher cost) - *To be implemented*
   */
  async parse(buffer: Buffer): Promise<NormalizedTransaction[]> {
    try {
      // Optional debug (remove after confirming)
      // console.log('pdfParse typeof:', typeof pdfParse);

      // @ts-ignore
      const data = await pdfParse(buffer);
      const text = data?.text || '';

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
      console.error('PDF Parsing failed:', error);
      throw new Error(`Failed to parse PDF file: ${error?.message || 'Unknown error'}`);
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

    // 1. Date: DD/MM/YYYY or DD-MMM-YYYY or YYYY-MM-DD or "DD MMM YYYY"
    const dateRegex =
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{2}\s[A-Za-z]{3}\s\d{4})/;

    // 2. Amount: Numbers with commas, optional decimals, optional negative sign
    const amountRegex = /([\d,]+\.\d{2})|([\d,]+)/g;

    // Check if PDF is likely scanned/image-only
    if (text.trim().length < 50 && text.trim().length > 0) {
      console.warn('PDF has very little text. It might be scanned (image-only).');
    }

    for (const line of lines) {
      const dateMatch = line.match(dateRegex);
      if (!dateMatch) continue;

      const dateStr = dateMatch[0];
      const date = this.normalizeDate(dateStr);
      if (!date) continue;

      const amounts = line.match(amountRegex);
      if (!amounts || amounts.length < 1) continue;

      const restOfLine = line.replace(dateStr, '').trim();

      let description = restOfLine;
      for (const amt of amounts) {
        description = description.replace(amt, '');
      }
      description = description.replace(/Cr|Dr/gi, '').trim();
      description = description.replace(/[^\w\s\-\.]/g, '');

      let amount = 0;
      let type: 'income' | 'expense' = 'expense';

      const numericAmounts = amounts.map((a) => parseFloat(a.replace(/,/g, '')));

      if (numericAmounts.length >= 2) {
        const isCredit = /Cr|Credit/i.test(line);
        const isDebit = /Dr|Debit/i.test(line);

        if (isCredit) {
          type = 'income';
          amount = numericAmounts[0];
        } else if (isDebit) {
          type = 'expense';
          amount = numericAmounts[0];
        } else {
          amount = numericAmounts[0];
        }
      } else {
        amount = numericAmounts[0];
      }

      if (amount === 0 || isNaN(amount)) continue;

      transactions.push({
        date,
        description,
        amount,
        type,
        currency: 'NGN',
        raw_row: line,
      });
    }

    return transactions;
  }

  // ✅ Slightly safer date normalizer (optional but recommended)
  private normalizeDate(dateStr: string): string | null {
    // DD/MM/YYYY
    const m1 = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m1) {
      const [, dd, mm, yyyy] = m1;
      return `${yyyy}-${mm}-${dd}`;
    }

    // YYYY-MM-DD
    const m2 = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m2) return dateStr;

    // Fallback: Date can parse "15 Feb 2026" etc.
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }
}
