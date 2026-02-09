import { stringify } from 'csv-stringify/sync';

interface Transaction {
  date: string;
  description: string;
  amount: number | string;
  type: string;
  category?: string;
  is_deductible?: boolean;
  status?: string;
}

export function generateCSV(transactions: Transaction[]): string {
  if (!transactions || transactions.length === 0) {
    return '';
  }

  // Format data for CSV
  const data = transactions.map(tx => ({
    Date: new Date(tx.date).toLocaleDateString(),
    Description: tx.description,
    Amount: tx.amount,
    Type: tx.type,
    Category: tx.category || 'Uncategorized',
    'Tax Deductible': tx.is_deductible ? 'Yes' : 'No',
    Status: tx.status
  }));

  // Generate CSV string
  return stringify(data, {
    header: true,
    columns: ['Date', 'Description', 'Amount', 'Type', 'Category', 'Tax Deductible', 'Status']
  });
}
