"use client";

import React from 'react';

// TODO: Fetch transactions from the database
const transactions = [
  { id: '1', date: '2026-03-10', description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment' },
  { id: '2', date: '2026-03-09', description: 'Salary Deposit', amount: 5000, category: 'Income' },
];

export const TransactionList: React.FC = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-700">Date</th>
              <th className="py-2 px-4 border-b border-gray-700">Description</th>
              <th className="py-2 px-4 border-b border-gray-700">Amount</th>
              <th className="py-2 px-4 border-b border-gray-700">Category</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td className="py-2 px-4 border-b border-gray-700">{tx.date}</td>
                <td className="py-2 px-4 border-b border-gray-700">{tx.description}</td>
                <td className={`py-2 px-4 border-b border-gray-700 ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{tx.amount}</td>
                <td className="py-2 px-4 border-b border-gray-700">{tx.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
