export interface AccountInformation {
  accountName: string | null;
  accountNumber: string | null;
  bankName: string;
  statementPeriod: {
    startDate: string | null;
    endDate: string | null;
  };
  openingBalance: number | null;
  closingBalance: number | null;
}

export interface NormalizedTransaction {
  transactionId: string | null;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  currency: string;
}

export interface IBankParser {
  // A method to quickly check if this parser is suitable for the given PDF text content
  isApplicable(text: string): boolean;
  
  // The main method to parse the PDF text and return normalized data
  parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] };
}
