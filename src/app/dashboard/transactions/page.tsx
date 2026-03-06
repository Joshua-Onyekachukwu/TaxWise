'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  is_deductible: boolean;
  category: string;
}

const TransactionsPage = () => {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to view transactions.');
        setLoading(false);
        return;
      }

      const { data, error: txError } = await supabase
        .from('transactions')
        .select(`
          id,
          date,
          description,
          amount,
          type,
          status,
          is_deductible,
          categories (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (txError) {
        console.error('Error fetching transactions:', txError);
        setError('Failed to fetch transactions.');
      } else {
        const mappedData: Transaction[] = data.map((tx: any) => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          is_deductible: tx.is_deductible,
          category: tx.categories?.name || 'Uncategorized',
        }));
        setTransactions(mappedData);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/dashboard/transactions/new" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Add Transaction
        </Link>
      </div>

      {loading && <div>Loading transactions...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.category !== 'Uncategorized' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && transactions.length === 0 && !error && (
        <div className="mt-6 text-center text-gray-500">
            You haven\'t added or uploaded any transactions yet.
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
