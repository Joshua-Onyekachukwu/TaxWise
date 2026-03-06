import * as fs from 'fs';
import * as path from 'path';
import { PdfParserService } from '@/lib/parsing/pdf-parser';

async function testParsing() {
  const parser = new PdfParserService();

  // Create a mock GTBank statement text
  const mockStatement = `
    Guaranty Trust Bank
    Account Statement
    DATE        DESCRIPTION      DEBIT          CREDIT         BALANCE
    15-Jan-2024   TRANSFER FROM XXX  0.00           10,000.00      50,000.00
    16-Jan-2024   UBER RIDE        1,500.00       0.00           48,500.00
  `;

  try {
    console.log('--- Running GTBank Test ---');
    const transactions = await parser.parse(Buffer.from(mockStatement));

    if (transactions.length === 2 && transactions[0].amount === 10000) {
      console.log('✅ GTBank Test Passed');
    } else {
      console.error('❌ GTBank Test Failed');
      console.log('Expected 2 transactions, but got:', transactions.length);
      console.log(transactions);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testParsing();
