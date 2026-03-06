import { NormalizedTransaction } from '../csv-adapters/types';
import { bankParsers } from './banks/index';
const pdf = require('pdf-parse');

export class PdfParserService {
  async parse(buffer: Buffer): Promise<NormalizedTransaction[]> {
    try {
      const data = await pdf(buffer);
      const text = data.text;

      const compatibleParser = bankParsers.find((parser) =>
        parser.compatibilityTest.test(text)
      );

      if (compatibleParser) {
        return compatibleParser.parse(text);
      }

      console.warn('No compatible bank parser found. Using generic regex parser.');
      return this.parseWithGenericRegex(text);
    } catch (error: any) {
      console.error('PDF Parsing failed:', error);
      throw new Error(`Failed to parse PDF file: ${error?.message || 'Unknown error'}`);
    }
  }

  private parseWithGenericRegex(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const lines = text.split('\n');

    const dateRegex =
      /(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{2}\s[A-Za-z]{3}\s\d{4})/;

    const amountRegex = /([\d,]+\.\d{2})|([\d,]+)/g;

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
