export interface CsvAdapter {
    /**
     * Check if this adapter can parse the given CSV preview.
     * @param filePreview The first few lines of the CSV file.
     * @returns A confidence score between 0 and 1.
     */
    match(filePreview: string): number;

    /**
     * Map CSV headers to the internal NormalizedTransaction schema.
     * @param headers The headers from the CSV file.
     * @returns A mapping object where keys are internal field names and values are CSV column names.
     */
    mapColumns(headers: string[]): ColumnMapping;

    /**
     * Parse a single row from the CSV into a NormalizedTransaction.
     * @param row The row data from the CSV.
     * @param mapping The column mapping to use.
     * @returns A normalized transaction object.
     */
    parseRow(row: any, mapping: ColumnMapping): Promise<NormalizedTransaction>;
}

export interface ColumnMapping {
    date: string;
    description: string;
    amount?: string; // If signed amount column exists
    debit?: string; // If debit/credit columns exist
    credit?: string; // If debit/credit columns exist
    currency?: string;
    [key: string]: string | undefined;
}

export interface NormalizedTransaction {
    date: string; // ISO 8601 date string (YYYY-MM-DD)
    description: string;
    amount: number; // Always positive
    type: 'income' | 'expense';
    currency: string; // Default 'NGN'
    raw_row: any; // For debugging
}
