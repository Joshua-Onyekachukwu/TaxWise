"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Account {
  id: string;
  name: string;
}

export const AccountSelector: React.FC<{ selectedAccountId: string; setSelectedAccountId: (id: string) => void; }> = ({ selectedAccountId, setSelectedAccountId }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('accounts').select('id, name');
      if (error) {
        console.error('Error fetching accounts:', error);
      } else {
        setAccounts(data as Account[]);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <select 
      value={selectedAccountId}
      onChange={(e) => setSelectedAccountId(e.target.value)}
      className="block w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      {accounts.map(account => (
        <option key={account.id} value={account.id}>{account.name}</option>
      ))}
    </select>
  );
};
