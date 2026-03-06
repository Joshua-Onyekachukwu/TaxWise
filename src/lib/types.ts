export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    status: string;
    is_deductible: boolean;
    category: string;
}
