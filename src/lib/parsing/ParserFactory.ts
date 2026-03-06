import { PdfParserService } from './pdf-parser';

// A proper CSV parser and adapter will be implemented in Phase 2.
// This is a placeholder to satisfy dependencies.
class CsvParserService {
  async parse(buffer: Buffer): Promise<any[]> {
    console.warn("CSV parsing is not fully implemented.");
    return [];
  }
}

export class ParserFactory {
  createParser(fileType: 'pdf' | 'csv') {
    if (fileType === 'pdf') {
      return new PdfParserService();
    }
    // Basic placeholder for CSV
    return new CsvParserService();
  }
}
