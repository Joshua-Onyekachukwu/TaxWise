import { CsvAdapter, ColumnMapping, NormalizedTransaction } from './types';

export class GenericAdapter implements CsvAdapter {
    private readonly SYNONYMS = {
        date: ['date', 'transaction date', 'value date', 'posting date'],
        description: ['description', 'narration', 'remarks', 'details', 'memo', 'particulars'],
        amount: ['amount', 'transaction amount', 'value'],
        type: ['type', 'transaction type', 'cr/dr', 'dr/cr'],
        debit: ['debit', 'withdrawal', 'dr'],
        credit: ['credit', 'deposit', 'cr'],
        balance: ['balance', 'running balance', 'available balance']
    };

    match(filePreview: string): number {
        // Simple heuristic: check if common headers are present
        const lowerPreview = filePreview.toLowerCase();
        let score = 0;
        
        if (this.SYNONYMS.date.some(s => lowerPreview.includes(s))) score += 0.3;
        if (this.SYNONYMS.description.some(s => lowerPreview.includes(s))) score += 0.3;
        if (this.SYNONYMS.amount.some(s => lowerPreview.includes(s)) || 
            (this.SYNONYMS.debit.some(s => lowerPreview.includes(s)) && this.SYNONYMS.credit.some(s => lowerPreview.includes(s)))) {
            score += 0.4;
        }

        return score;
    }

    mapColumns(headers: string[]): ColumnMapping {
        // Normalize headers: remove BOM, trim, lowercase
        const lowerHeaders = headers.map(h => h.replace(/^\uFEFF/, '').toLowerCase().trim());
        const mapping: ColumnMapping = {
            date: '',
            description: ''
        };

        // Helper to find best match
        const findMatch = (synonyms: string[]) => {
            return headers.find((h, i) => synonyms.includes(lowerHeaders[i])) || '';
        };

        mapping.date = findMatch(this.SYNONYMS.date);
        mapping.description = findMatch(this.SYNONYMS.description);
        mapping.type = findMatch(this.SYNONYMS.type);
        
        // Try to find Amount vs Debit/Credit
        const amountCol = findMatch(this.SYNONYMS.amount);
        if (amountCol) {
            mapping.amount = amountCol;
        } else {
            mapping.debit = findMatch(this.SYNONYMS.debit);
            mapping.credit = findMatch(this.SYNONYMS.credit);
        }

        return mapping;
    }

    async parseRow(row: any, mapping: ColumnMapping): Promise<NormalizedTransaction> {
        let amount = 0;
        let type: 'income' | 'expense' = 'expense';

        // Parse Date (basic implementation - likely needs robust date library later)
        const dateStr = row[mapping.date];
        let date = new Date().toISOString().split('T')[0]; // Default fallback
        if (dateStr) {
             // Try basic parsing, can improve with libraries like date-fns
            try {
                date = new Date(dateStr).toISOString().split('T')[0];
            } catch (e) {
                console.warn('Failed to parse date:', dateStr);
            }
        }

        // Determine Amount and Type
        if (mapping.amount) {
            const rawAmount = this.cleanNumber(row[mapping.amount]);
            amount = Math.abs(rawAmount);

            // If explicit Type column exists, use it
            if (mapping.type && row[mapping.type]) {
                const typeVal = row[mapping.type].toLowerCase();
                if (typeVal.includes('debit') || typeVal.includes('dr') || typeVal === 'expense' || typeVal.includes('withdrawal')) {
                    type = 'expense';
                } else if (typeVal.includes('credit') || typeVal.includes('cr') || typeVal === 'income' || typeVal.includes('deposit')) {
                    type = 'income';
                } else {
                    // Fallback to sign if type is ambiguous
                     type = rawAmount < 0 ? 'expense' : 'income';
                }
            } else {
                // No Type column, use sign
                if (rawAmount < 0) {
                    type = 'expense';
                } else {
                    type = 'income';
                }
            }
        } else if (mapping.debit && mapping.credit) {
            const debit = this.cleanNumber(row[mapping.debit]);
            const credit = this.cleanNumber(row[mapping.credit]);

            if (debit > 0) {
                type = 'expense';
                amount = debit;
            } else if (credit > 0) {
                type = 'income';
                amount = credit;
            }
        }

        return {
            date,
            description: row[mapping.description] || '',
            amount,
            type,
            currency: 'NGN', // Default for MVP
            raw_row: row
        };
    }

    private cleanNumber(val: any): number {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        // Remove commas, currency symbols, whitespace
        const clean = val.toString().replace(/[^0-9.-]/g, '');
        return parseFloat(clean) || 0;
    }
}
