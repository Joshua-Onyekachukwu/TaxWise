import { AccessBankParser } from './accessbank-parser';
import { FirstBankParser } from './firstbank-parser';
import { GTBankParser } from './gtbank-parser';
import { KudaBankParser } from './kuda-parser';
import { MoniepointParser } from './moniepoint-parser';
import { OPayParser } from './opay-parser';
import { UBABankParser } from './uba-parser';
import { ZenithBankParser } from './zenithbank-parser';

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
