"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  is_deductible: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const DeductiblesPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*');
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (transactionsError) console.error('Error fetching transactions:', transactionsError);
    else setTransactions(transactionsData as Transaction[]);

    if (categoriesError) console.error('Error fetching categories:', categoriesError);
    else setCategories(categoriesData as Category[]);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = async (transactionId: string, newCategoryId: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ category_id: newCategoryId })
      .eq('id', transactionId);

    if (error) console.error('Error updating category:', error);
    else fetchData(); // Refresh data
  };

  const toggleDeductible = async (transactionId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('transactions')
      .update({ is_deductible: !currentStatus })
      .eq('id', transactionId);

    if (error) console.error('Error updating deductible status:', error);
    else fetchData(); // Refresh data
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Deductibles</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Deductible</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-gray-700">
                <td className="p-4">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="p-4">{tx.description}</td>
                <td className={`p-4 ${tx.credit ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.credit || tx.debit}
                </td>
                <td className="p-4">
                  <select 
                    value={tx.category_id || ''}
                    onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                    className="bg-gray-700 text-white p-2 rounded"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleDeductible(tx.id, tx.is_deductible)}
                    className={`px-4 py-2 rounded ${tx.is_deductible ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {tx.is_deductible ? 'Yes' : 'No'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeductiblesPage;
