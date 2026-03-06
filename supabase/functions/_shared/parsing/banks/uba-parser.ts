import { BankStatementParser } from './types.ts';
import { NormalizedTransaction } from '../../csv-adapters/types.ts';

export class UBABankParser implements BankStatementParser {
  bankIdentifier = 'uba';

  compatibilityTest = /UBA|United Bank for Africa/i;

  parse(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const statementBody = text.substring(text.indexOf('DATE'), text.lastIndexOf('CLOSING BALANCE'));
    const lines = statementBody.split('\n').filter(line => line.trim() !== '');

    const transactionRegex = /^(?<date>\d{2}-\w{3}-\d{4})\s+(?<description>.+?)(?=\s{2,}|$)/;
    const amountRegex = /(?<debit>[\d,]+\.\d{2})\s+(?<credit>[\d,]+\.\d{2})\s+(?<balance>[\d,]+\.\d{2})?$/;

    for (const line of lines) {
      const transactionMatch = line.match(transactionRegex);
      const amountMatch = line.match(amountRegex);

      if (transactionMatch?.groups && amountMatch?.groups) {
        const { date, description } = transactionMatch.groups;
        const { debit, credit } = amountMatch.groups;

        const debitAmount = parseFloat(debit.replace(/,/g, ''));
        const creditAmount = parseFloat(credit.replace(/,/g, ''));

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
