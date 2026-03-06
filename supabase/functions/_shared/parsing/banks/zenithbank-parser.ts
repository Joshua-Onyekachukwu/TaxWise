import { BankStatementParser } from './types.ts';
import { NormalizedTransaction } from '../../csv-adapters/types.ts';

export class ZenithBankParser implements BankStatementParser {
  bankIdentifier = 'zenithbank';

  compatibilityTest = /Zenith Bank/i;

  parse(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const statementBody = text.substring(text.indexOf('TRANSACTION DATE'), text.lastIndexOf('Closing Balance'));
    const lines = statementBody.split('\n').filter(line => line.trim() !== '');

    const transactionRegex = /^(?<date>\d{2}\s\w{3}\s\d{4})\s+(?<description>.+?)(?=\s{2,}|$)/;
    const amountRegex = /(?<debit>[\d,]+\.\d{2})\s+(?<credit>[\d,]+\.\d{2})\s+(?<balance>[\d,]+\.\d{2})?$/;

    for (const line of lines) {
      const match = line.match(transactionRegex);

      if (match?.groups) {
        const { date, description, debit, credit } = match.groups;

        const debitAmount = parseFloat(debit.replace(/,/g, ''));
        const creditAmount = parseFloat(credit.replace(/,/g, ''));

        if (debitAmount === 0 && creditAmount === 0) {
          continue;
        }

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
    const [day, monthStr, year] = dateStr.split(' ');
    const monthMap: { [key: string]: string } = {
      JAN: '01',
      FEB: '02',
      MAR: '03',
      APR: '04',
      MAY: '05',
      JUN: '06',
      JUL: '07',
      AUG: '08',
      SEP: '09',
      OCT: '10',
      NOV: '11',
      DEC: '12',
    };
    const month = monthMap[monthStr.toUpperCase()];
    return `${year}-${month}-${day}`;
  }
}
