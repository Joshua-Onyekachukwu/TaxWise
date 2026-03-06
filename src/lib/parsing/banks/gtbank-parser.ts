import { BankStatementParser } from './types';
import { NormalizedTransaction } from '../../csv-adapters/types';

export class GTBankParser implements BankStatementParser {
  bankIdentifier = 'gtbank';

  // A simple regex to check for common GTBank statement headers.
  compatibilityTest = /Guaranty Trust Bank/i;

  parse(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const lines = text.split('\n');

    // Regex to identify a transaction line in a GTBank statement.
    // This is a placeholder and will need to be refined with real statement data.
    // Format: DATE  DESCRIPTION  DEBIT  CREDIT  BALANCE
    // GTBank statements often have a header and footer that we should ignore.
    const statementBody = text.substring(text.indexOf('DATE'), text.lastIndexOf('Closing Balance'));
    const transactionLines = statementBody.split('\n').filter(line => line.trim() !== '');

    // Regex to capture date, description, and amounts. This is more flexible.
    const transactionRegex = /^(?<date>\d{2}-\w{3}-\d{4})\s+(?<description>.+?)(?=\s{2,}|$)/;
    const amountRegex = /(?<debit>[\d,]+\.\d{2})\s+(?<credit>[\d,]+\.\d{2})\s+(?<balance>[\d,]+\.\d{2})?$/;

    for (const line of transactionLines) {
      const transactionMatch = line.match(transactionRegex);
      const amountMatch = line.match(amountRegex);

      if (transactionMatch?.groups && amountMatch?.groups) {
        const { date, description } = transactionMatch.groups;
        const { debit, credit } = amountMatch.groups;

        const debitAmount = parseFloat(debit.replace(/,/g, ''));
        const creditAmount = parseFloat(credit.replace(/,/g, ''));

        // Skip lines that are not transactions (e.g., headers repeated in the body)
        if (isNaN(debitAmount) && isNaN(creditAmount)) continue;

        const transaction: NormalizedTransaction = {
          date: this.normalizeDate(date),
          description: description.trim(),
          amount: debitAmount > 0 ? debitAmount : creditAmount,
          type: debitAmount > 0 ? 'expense' : 'income',
          currency: 'NGN',
          raw_row: line,
        };

        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private normalizeDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  }
}
