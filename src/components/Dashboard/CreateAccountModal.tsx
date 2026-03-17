"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onAccountCreated }) => {
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create an account.');
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('accounts').insert({
      name: accountName,
      bank: bankName,
      account_number: accountNumber,
      user_id: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
    } else {
      onAccountCreated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Create New Account</h2>
          <button onClick={onClose} className="text-white text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-white mb-2">Account Name</label>
            <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Bank Name</label>
            <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Account Number</label>
            <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-500">
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
