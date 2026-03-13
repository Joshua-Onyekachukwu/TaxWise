import { Logger } from '../logger.ts';
import { IBankParser, AccountInformation, NormalizedTransaction } from './banks/types.ts';
import { OpayParser } from './banks/opay-parser.ts';
import { KudaParser } from './banks/kuda-parser.ts';
import { UbaParser } from './banks/uba-parser.ts';
import { GtbankParser } from './banks/gtbank-parser.ts';
import { AccessParser } from './banks/access-parser.ts';

export class ParserService {
  private parsers: IBankParser[];

  constructor() {
    this.parsers = [
      new OpayParser(),
      new KudaParser(),
      new UbaParser(),
      new GtbankParser(),
      new AccessParser(),
    ];
  }

  public parse(text: string): { accountInfo: AccountInformation, transactions: NormalizedTransaction[] } | null {
    const parser = this.parsers.find(p => p.isApplicable(text));

    if (!parser) {
      Logger.warn('No compatible bank parser found.');
      return null;
    }

    return parser.parse(text);
  }
}
