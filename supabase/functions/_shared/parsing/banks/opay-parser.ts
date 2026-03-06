import { BankStatementParser } from './types.ts';
import { NormalizedTransaction } from '../../csv-adapters/types.ts';

export class OPayParser implements BankStatementParser {
  bankIdentifier = 'opay';

  compatibilityTest = /OPay/i;

  parse(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const statementBody = text.substring(text.indexOf('Date'), text.lastIndexOf('Balance'));
    const lines = statementBody.split('\n').filter(line => line.trim() !== '');

    const transactionRegex = /^(?<date>\d{4}-\d{2}-\d{2})\s+(?<time>\d{2}:\d{2}:\d{2})\s+(?<type>DEBIT|CREDIT)\s+(?<description>.+?)(?=\s{2,}|$)/;
    const amountRegex = /(?<amount>[\d,]+\.\d{2})$/;

    for (const line of lines) {
      const match = line.match(transactionRegex);

      if (match?.groups) {
        const { date, description, type, amount } = match.groups;

        const transaction: NormalizedTransaction = {
          date: this.normalizeDate(date),
          description: description.trim(),
          amount: parseFloat(amount.replace(/,/g, '')),
          type: type === 'DEBIT' ? 'expense' : 'income',
          currency: 'NGN',
          raw_row: line,
        };

        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private normalizeDate(dateStr: string): string {
    return dateStr;
  }
}
