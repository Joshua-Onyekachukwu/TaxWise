import { BankStatementParser } from './types';
import { NormalizedTransaction } from '../../csv-adapters/types';

export class KudaBankParser implements BankStatementParser {
  bankIdentifier = 'kuda';

  compatibilityTest = /Kuda Microfinance Bank/i;

  parse(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const statementBody = text.substring(text.indexOf('Date'), text.lastIndexOf('Balance'));
    const lines = statementBody.split('\n').filter(line => line.trim() !== '');

    const transactionRegex = /^(?<date>\d{2}\s\w{3},\s\d{4})\s+(?<description>.+?)(?=\s{2,}|$)/;
    const amountRegex = /(?<debit>[\d,]+\.\d{2}-)|(?<credit>[\d,]+\.\d{2}\+)/;

    for (const line of lines) {
      const transactionMatch = line.match(transactionRegex);
      const amountMatch = line.match(amountRegex);

      if (transactionMatch?.groups && amountMatch?.groups) {
        const { date, description } = transactionMatch.groups;
        const { debit, credit } = amountMatch.groups;

        const debitAmount = debit ? parseFloat(debit.replace(/,/g, '')) : 0;
        const creditAmount = credit ? parseFloat(credit.replace(/,/g, '')) : 0;

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
