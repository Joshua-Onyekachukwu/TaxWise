import { IBankParser, AccountInformation, NormalizedTransaction } from './types.ts';

export class AccessParser implements IBankParser {
  isApplicable(text: string): boolean {
    return text.includes("Access Bank");
  }

  parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] } {
    // Implementation to be added once sample statements are provided
    const accountInfo: AccountInformation = { /* ... */ bankName: 'Access Bank' };
    const transactions: NormalizedTransaction[] = [];
    return { accountInfo, transactions };
  }
}
