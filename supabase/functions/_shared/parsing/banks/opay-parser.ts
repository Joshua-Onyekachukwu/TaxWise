import { IBankParser, AccountInformation, NormalizedTransaction } from './types.ts';

export class OpayParser implements IBankParser {
  isApplicable(text: string): boolean {
    return text.includes("OPay") && text.includes("Transaction History");
  }

  parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] } {
    const accountInfo: AccountInformation = this.extractAccountInfo(text);
    const transactions: NormalizedTransaction[] = this.extractTransactions(text);
    return { accountInfo, transactions };
  }

  private extractAccountInfo(text: string): AccountInformation {
    const accountName = text.match(/Name: (.*)/)?.[1].trim();
    const accountNumber = text.match(/Account Number: (.*)/)?.[1].trim();
    const statementPeriod = text.match(/Date: (.*) to (.*)/);

    return {
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      bankName: 'OPay',
      statementPeriod: {
        startDate: statementPeriod ? statementPeriod[1].trim() : null,
        endDate: statementPeriod ? statementPeriod[2].trim() : null,
      },
      openingBalance: null, // OPay statements don't typically have opening/closing balances
      closingBalance: null,
    };
  }

  private extractTransactions(text: string): NormalizedTransaction[] {
    const transactions: NormalizedTransaction[] = [];
    const regex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+(.*?)\s+(SUCCESSFUL|PENDING|FAILED)\s+([\d,]+\.\d{2})$/gm;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const description = match[2].trim();
      const amount = this.parseAmount(match[4]);
      const isCredit = description.toLowerCase().includes('transfer from') || description.toLowerCase().includes('credit');

      transactions.push({
        transactionId: null,
        date: match[1],
        description,
        debit: isCredit ? null : amount,
        credit: isCredit ? amount : null,
        balance: null, // OPay statements often don't have a running balance column
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
