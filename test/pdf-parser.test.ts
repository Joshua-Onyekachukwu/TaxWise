import * as fs from 'fs';
import * as path from 'path';
import { PdfParserService } from '../src/lib/parsing/pdf-parser';

describe('PdfParserService', () => {
  let parser: PdfParserService;

  beforeAll(() => {
    parser = new PdfParserService();
  });

  it('should correctly identify and parse a GTBank statement', async () => {
    // Create a mock GTBank statement text
    const mockStatement = `
      Guaranty Trust Bank
      Account Statement
      DATE        DESCRIPTION      DEBIT          CREDIT         BALANCE
      15-Jan-2024   TRANSFER FROM XXX  0.00           10,000.00      50,000.00
      16-Jan-2024   UBER RIDE        1,500.00       0.00           48,500.00
    `;

    const transactions = await parser.parse(Buffer.from(mockStatement));

    expect(transactions.length).toBe(2);
    expect(transactions[0].description).toBe('TRANSFER FROM XXX');
    expect(transactions[0].type).toBe('income');
    expect(transactions[0].amount).toBe(10000);
    expect(transactions[1].description).toBe('UBER RIDE');
    expect(transactions[1].type).toBe('expense');
    expect(transactions[1].amount).toBe(1500);
  });

  // Add more tests for other banks here...
});
