"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface BankAccount {
  id: string;
  institution_name: string;
  account_name: string;
  currency: string;
}

interface BankAccountManagerProps {
  onAccountSelect: (accountId: string) => void;
  selectedAccountId?: string | null;
}

export const BankAccountManager: React.FC<BankAccountManagerProps> = ({ onAccountSelect, selectedAccountId }) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({ institution_name: "", account_name: "" });
  const supabase = createClient();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase.from("bank_accounts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setAccounts(data || []);
      
      // If no account selected but accounts exist, select the first one?
      // Optional: auto-select first
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAccount.institution_name || !newAccount.account_name) return;
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data, error } = await supabase.from("bank_accounts").insert({
        user_id: user.id,
        institution_name: newAccount.institution_name,
        account_name: newAccount.account_name,
        currency: 'NGN' // Default for MVP
      }).select().single();

      if (error) throw error;

      setAccounts([data, ...accounts]);
      onAccountSelect(data.id);
      setIsCreating(false);
      setNewAccount({ institution_name: "", account_name: "" });
    } catch (err) {
      console.error("Failed to create account:", err);
      alert("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && accounts.length === 0) return <div className="text-sm text-gray-500">Loading accounts...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Bank Account
         </label>
         <button 
           onClick={() => setIsCreating(!isCreating)}
           className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1"
         >
            <i className="material-symbols-outlined !text-sm">add</i>
            New Account
         </button>
      </div>

      {isCreating ? (
          <div className="bg-gray-50 dark:bg-[#15203c] p-3 rounded-md border border-gray-200 dark:border-[#172036]">
              <div className="grid grid-cols-2 gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Bank Name (e.g. GTBank)"
                    className="p-2 text-sm border rounded dark:bg-[#0c1427] dark:border-[#172036]"
                    value={newAccount.institution_name}
                    onChange={e => setNewAccount({...newAccount, institution_name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Account Label (e.g. Savings)"
                    className="p-2 text-sm border rounded dark:bg-[#0c1427] dark:border-[#172036]"
                    value={newAccount.account_name}
                    onChange={e => setNewAccount({...newAccount, account_name: e.target.value})}
                  />
              </div>
              <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                  >
                      Cancel
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={!newAccount.institution_name || !newAccount.account_name}
                    className="text-xs bg-primary-500 text-white px-3 py-1 rounded hover:bg-primary-600 disabled:opacity-50"
                  >
                      Create
                  </button>
              </div>
          </div>
      ) : (
          <select 
            className="w-full p-2.5 bg-white dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] rounded-md text-sm outline-none focus:border-primary-500"
            value={selectedAccountId || ""}
            onChange={(e) => onAccountSelect(e.target.value)}
          >
            <option value="">-- Select an Account --</option>
            {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {acc.institution_name} - {acc.account_name} ({acc.currency})
                </option>
            ))}
          </select>
      )}
    </div>
  );
};
