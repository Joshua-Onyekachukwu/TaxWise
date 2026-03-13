# Bank Statement Parsing System

This document provides a detailed overview of the bank statement parsing system in Taxwise.

## Architecture

The parsing system is designed to be modular and extensible. It consists of a `ParserFactory` that creates the appropriate parser based on the file type (PDF or CSV), and a `ParserService` that orchestrates the parsing process.

Each bank has its own parser class that implements the `IBankParser` interface. This interface defines two methods:

- `isApplicable(text: string): boolean`: This method checks if the parser is suitable for the given text content.
- `parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] }`: This method parses the text and returns the normalized account information and transactions.

## Data Schemas

The parsing system uses two main data schemas:

### `AccountInformation`

This schema defines the structure for the account information extracted from the bank statement.

```typescript
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
```

### `NormalizedTransaction`

This schema defines the structure for the normalized transaction data.

```typescript
export interface NormalizedTransaction {
  transactionId: string | null;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  currency: string;
}
```

## How to Add a New Bank Parser

To add a new bank parser, follow these steps:

1.  **Create a new parser class**: Create a new file in the `supabase/functions/_shared/parsing/banks` directory for your new parser (e.g., `my-bank-parser.ts`).
2.  **Implement the `IBankParser` interface**: Your new class must implement the `IBankParser` interface and its `isApplicable` and `parse` methods.
3.  **Add the parser to the `ParserService`**: Open the `supabase/functions/_shared/parsing/ParserService.ts` file and add your new parser to the `parsers` array in the constructor.
4.  **Create unit tests**: Create a new test file in the `supabase/functions/_shared/parsing/banks` directory for your new parser (e.g., `my-bank-parser.test.ts`). Add unit tests to verify that your parser is working correctly.
