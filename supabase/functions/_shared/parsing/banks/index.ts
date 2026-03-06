import { AccessBankParser } from './accessbank-parser.ts';
import { FirstBankParser } from './firstbank-parser.ts';
import { GTBankParser } from './gtbank-parser.ts';
import { KudaBankParser } from './kuda-parser.ts';
import { MoniepointParser } from './moniepoint-parser.ts';
import { OPayParser } from './opay-parser.ts';
import { UBABankParser } from './uba-parser.ts';
import { ZenithBankParser } from './zenithbank-parser.ts';

export const bankParsers = [
  new GTBankParser(),
  new AccessBankParser(),
  new ZenithBankParser(),
  new UBABankParser(),
  new FirstBankParser(),
  new KudaBankParser(),
  new OPayParser(),
  new MoniepointParser(),
];
