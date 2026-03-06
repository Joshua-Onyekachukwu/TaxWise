'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

const NewTransactionPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }
      setUser(user);

      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      
      if (cats) setCategories(cats);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        description,
        amount: parseFloat(amount),
        date,
        type,
        category_id: categoryId || null,
        status: 'approved', // Manually added transactions are pre-approved
        source: 'manual',
      },
    ]);

    if (insertError) {
      console.error('Error inserting transaction:', insertError);
      setError('Could not save transaction. Please try again.');
      setIsSubmitting(false);
    } else {
      router.push('/dashboard/transactions');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Transaction</h1>
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm">
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewTransactionPage;
