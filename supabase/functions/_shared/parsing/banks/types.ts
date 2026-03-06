import { NormalizedTransaction } from '../../csv-adapters/types.ts';

export interface BankStatementParser {
  /**
   * A unique identifier for the bank this parser supports.
   * e.g., 'gtbank', 'accessbank'
   */
  bankIdentifier: string;

  /**
   * A regex pattern to quickly test if this parser is likely
   * to be compatible with a given document text.
   */
  compatibilityTest: RegExp;

  /**
   * The core parsing logic to extract transactions from the text.
   * @param text The full text content of the PDF.
   * @returns An array of normalized transactions.
   */
  parse(text: string): NormalizedTransaction[];
}
