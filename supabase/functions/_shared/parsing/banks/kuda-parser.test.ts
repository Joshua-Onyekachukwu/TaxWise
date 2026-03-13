import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";
import { KudaParser } from './kuda-parser.ts';

const mockKudaStatement = `
Statement of Account
kuda.com

Account Name: JOSHUA ONYEKACHUKWU
Account Number: 1234567890
Statement Period: 01/01/2026 to 31/01/2026
Opening Balance: 10,000.00
Closing Balance: 5,000.00

Date Description Debit Credit Balance
01/01/2026 Purchase from Amazon 500.00 9,500.00
15/01/2026 Transfer from John Doe 2,000.00 11,500.00
30/01/2026 Bill Payment - Netflix 1,500.00 10,000.00
`;

Deno.test("KudaParser - should correctly parse account information", () => {
  const parser = new KudaParser();
  const { accountInfo } = parser.parse(mockKudaStatement);

  assertEquals(accountInfo.accountName, "JOSHUA ONYEKACHUKWU");
  assertEquals(accountInfo.accountNumber, "1234567890");
  assertEquals(accountInfo.statementPeriod.startDate, "01/01/2026");
  assertEquals(accountInfo.statementPeriod.endDate, "31/01/2026");
  assertEquals(accountInfo.openingBalance, 10000);
  assertEquals(accountInfo.closingBalance, 5000);
});

Deno.test("KudaParser - should correctly parse transactions", () => {
  const parser = new KudaParser();
  const { transactions } = parser.parse(mockKudaStatement);

  assertEquals(transactions.length, 3);
  assertEquals(transactions[0].date, "01/01/2026");
  assertEquals(transactions[0].description, "Purchase from Amazon");
  assertEquals(transactions[0].debit, 500);
  assertEquals(transactions[0].credit, null);
  assertEquals(transactions[0].balance, 9500);
});
