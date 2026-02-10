import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { GenericAdapter } from '../src/lib/csv-adapters/generic-adapter';

// Mock types since we can't import easily in standalone script without ts-node setup
// But we can just use the logic directly.

async function validateDataset() {
    const filePath = path.join(__dirname, '../test-data/taxwise_2024_full_year.csv');
    console.log(`Reading file: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }) as any[];

    console.log(`Parsed ${records.length} raw records.`);

    const adapter = new GenericAdapter();
    const headers = Object.keys(records[0] || {});
    console.log('Headers:', headers);

    const mapping = adapter.mapColumns(headers);
    console.log('Detected Mapping:', mapping);

    const normalizedTxs = [];
    const txHashes = new Set();
    let duplicates = 0;
    let income = 0;
    let expenses = 0;

    for (const row of records) {
        const tx = await adapter.parseRow(row, mapping);
        
        // Filter empty/invalid
        if (tx.amount === 0 && !(row as any)['Balance']) continue; // Skip if 0, unless it's a balance row (which usually has empty amount or special handling, but our adapter returns 0 for empty)
        
        // Fix: Adapter returns 0 for empty string in Amount.
        // In our CSV, "Closing Balance" has empty Amount.
        if (tx.description === 'Closing Balance') continue;

        normalizedTxs.push(tx);

        // Deduplication Logic from Engine
        const txHash = `${tx.date}-${tx.amount}-${tx.description}-${tx.type}`;
        if (txHashes.has(txHash)) {
            duplicates++;
            console.log(`[Duplicate Detected] ${tx.date} - ${tx.description} (${tx.amount})`);
        } else {
            txHashes.add(txHash);
        }

        if (tx.type === 'income') income += tx.amount;
        else expenses += tx.amount;
    }

    console.log('\n--- Validation Results ---');
    console.log(`Total Valid Transactions: ${normalizedTxs.length}`);
    console.log(`Potential Duplicates: ${duplicates}`);
    console.log(`Total Income: N${income.toLocaleString()}`);
    console.log(`Total Expenses: N${expenses.toLocaleString()}`);
    console.log(`Net Flow: N${(income - expenses).toLocaleString()}`);
    
    // Expected Duplicates: "Christmas Lunch - Restaurant" on Dec 25 is duplicated in CSV
    if (duplicates === 1) {
        console.log('✅ Duplicate detection passed.');
    } else {
        console.log('❌ Duplicate detection failed (Expected 1).');
    }

    if (normalizedTxs.length > 50) {
        console.log('✅ Dataset volume is robust.');
    }
}

validateDataset();
