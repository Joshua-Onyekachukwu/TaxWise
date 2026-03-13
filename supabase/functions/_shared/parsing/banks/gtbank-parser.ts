import { IBankParser, AccountInformation, NormalizedTransaction } from './types.ts';

export class GtbankParser implements IBankParser {
  isApplicable(text: string): boolean {
    return text.includes("GTBank") && text.includes("Guaranty Trust Bank");
  }

  parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] } {
    // Implementation to be added once sample statements are provided
    const accountInfo: AccountInformation = {
      accountName: null,
      accountNumber: null,
      bankName: 'GTBank',
      statementPeriod: { startDate: null, endDate: null },
      openingBalance: null,
      closingBalance: null,
    };
    const transactions: NormalizedTransaction[] = [];
    return { accountInfo, transactions };
  }
}
