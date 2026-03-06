"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
}

interface BankAccountManagerProps {
  selectedAccountId: string | null;
  onAccountSelect: (id: string) => void;
}

export const BankAccountManager: React.FC<BankAccountManagerProps> = ({ selectedAccountId, onAccountSelect }) => {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('bank_accounts').select('id, bank_name, account_name');
      if (data) {
        setAccounts(data);
      }
      setIsLoading(false);
    };
    fetchAccounts();
  }, [supabase]);

  const handleAddAccount = async () => {
    if (!newBankName || !newAccountName) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newAccount, error } = await supabase
      .from('bank_accounts')
      .insert({ user_id: user.id, bank_name: newBankName, account_name: newAccountName })
      .select()
      .single();

    if (newAccount) {
      setAccounts([...accounts, newAccount]);
      onAccountSelect(newAccount.id);
      setIsModalOpen(false);
      setNewBankName('');
      setNewAccountName('');
    }
  };

  return (
    <div>
      <select
        value={selectedAccountId || ''}
        onChange={(e) => onAccountSelect(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
        disabled={isLoading}
      >
        <option value="">{isLoading ? 'Loading...' : 'Select Bank Account'}</option>
        {accounts.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.account_name}</option>
        ))}
      </select>
      <button onClick={() => setIsModalOpen(true)} className="text-sm text-primary-500 hover:underline mt-1">+ Add New Account</button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0c1427] p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Bank Account</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bank Name (e.g., GTBank)"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
              />
              <input
                type="text"
                placeholder="Account Name (e.g., Personal Savings)"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-[#15203c]"
              />
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={handleAddAccount} disabled={!newBankName || !newAccountName} className="bg-primary-500 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-400 disabled:opacity-50">Save Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
