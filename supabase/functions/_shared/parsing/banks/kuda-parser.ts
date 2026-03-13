import { IBankParser, AccountInformation, NormalizedTransaction } from './types.ts';

export class KudaParser implements IBankParser {
  isApplicable(text: string): boolean {
    // Kuda statements usually have a very clear header
    return text.includes("Statement of Account") && text.includes("kuda.com");
  }

  parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] } {
    const accountInfo: AccountInformation = this.extractAccountInfo(text);
    const transactions: NormalizedTransaction[] = this.extractTransactions(text);
    return { accountInfo, transactions };
  }

  private extractAccountInfo(text: string): AccountInformation {
    const accountName = text.match(/Account Name: (.*)/)?.[1].trim();
    const accountNumber = text.match(/Account Number: (.*)/)?.[1].trim();
    const statementPeriod = text.match(/Statement Period: (.*) to (.*)/);
    const openingBalance = text.match(/Opening Balance: (.*)/)?.[1].replace(/,/g, '');
    const closingBalance = text.match(/Closing Balance: (.*)/)?.[1].replace(/,/g, '');

    return {
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      bankName: 'Kuda Bank',
      statementPeriod: {
        startDate: statementPeriod ? statementPeriod[1].trim() : null,
        endDate: statementPeriod ? statementPeriod[2].trim() : null,
      },
      openingBalance: openingBalance ? parseFloat(openingBalance) : null,
      closingBalance: closingBalance ? parseFloat(closingBalance) : null,
    };
  }

  private extractTransactions(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const regex = /^(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$/gm;

    let match;
    while ((match = regex.exec(text)) !== null) {
      transactions.push({
        transactionId: null,
        date: match[1],
        description: match[2].trim(),
        debit: this.parseAmount(match[3]),
        credit: this.parseAmount(match[4]),
        balance: this.parseAmount(match[5]),
        currency: 'NGN',
      });
    }

    return transactions;
  }

  private parseAmount(amount: string): number | null {
    if (!amount || amount.trim() === "") return null;
    return parseFloat(amount.replace(/,/g, ''));
  }
}
