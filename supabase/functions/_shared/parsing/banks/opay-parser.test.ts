import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";
import { OpayParser } from './opay-parser.ts';

const mockOpayStatement = `
Transaction History
OPay

Name: JOSHUA OSEMEKE ONYEKACHUKWU
Account Number: 7083545184
Date: 2026-02-10 to 2026-03-10

2026-02-15 10:30:00 Transfer from John Doe SUCCESSFUL 5,000.00
2026-02-20 12:00:00 Purchase at Amazon SUCCESSFUL 1,200.00
2026-03-01 14:00:00 Airtime Purchase SUCCESSFUL 500.00
`;

Deno.test("OpayParser - should correctly parse account information", () => {
  const parser = new OpayParser();
  const { accountInfo } = parser.parse(mockOpayStatement);

  assertEquals(accountInfo.accountName, "JOSHUA OSEMEKE ONYEKACHUKWU");
  assertEquals(accountInfo.accountNumber, "7083545184");
  assertEquals(accountInfo.statementPeriod.startDate, "2026-02-10");
  assertEquals(accountInfo.statementPeriod.endDate, "2026-03-10");
});

Deno.test("OpayParser - should correctly parse transactions", () => {
  const parser = new OpayParser();
  const { transactions } = parser.parse(mockOpayStatement);

  assertEquals(transactions.length, 3);
  assertEquals(transactions[0].date, "2026-02-15 10:30:00");
  assertEquals(transactions[0].description, "Transfer from John Doe");
  assertEquals(transactions[0].credit, 5000);
  assertEquals(transactions[0].debit, null);
});
