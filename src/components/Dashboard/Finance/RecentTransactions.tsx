"use client";

import React from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  type: string;
  status: string;
  is_deductible: boolean;
  categories?: { name: string } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  // Helper to format currency
  const formatCurrency = (amount: number | string) => {
    return "₦" + Number(amount).toLocaleString();
  };

  // Helper for safe date formatting
  const formatDate = (dateString: string) => {
    // Check if we are on the server to prevent hydration mismatch
    // But since this is a "use client" component, we can just ensure deterministic formatting
    // Or use a simple string if the date is already YYYY-MM-DD
    if (!dateString) return "-";
    return dateString; // The API returns YYYY-MM-DD which is stable
  };

  // Helper for status styling
  const getStatusClass = (tx: Transaction) => {
    if (tx.status === 'pending_review') return "text-orange-700 bg-orange-100";
    if (tx.is_deductible) return "text-success-700 bg-success-100";
    return "text-gray-700 bg-gray-100"; // Personal/Other
  };

  const getStatusLabel = (tx: Transaction) => {
    if (tx.status === 'pending_review') return "Review";
    if (tx.is_deductible) return "Deductible";
    return "Personal";
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h5 className="text-lg font-bold text-black dark:text-white !mb-0">
          Recent Transactions
        </h5>
        <Link
          href="/dashboard/uploads"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#15203c]">
            <tr>
              <th className="text-left py-[10px] px-[15px] text-xs font-semibold text-gray-500 dark:text-gray-400 rounded-l-md">
                Date
              </th>
              <th className="text-left py-[10px] px-[15px] text-xs font-semibold text-gray-500 dark:text-gray-400">
                Description
              </th>
              <th className="text-left py-[10px] px-[15px] text-xs font-semibold text-gray-500 dark:text-gray-400">
                Amount
              </th>
              <th className="text-left py-[10px] px-[15px] text-xs font-semibold text-gray-500 dark:text-gray-400 rounded-r-md">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <tr key={txn.id || index} className="border-b border-gray-50 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                  <td className="py-[12px] px-[15px] text-gray-500 whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>
                  <td className="py-[12px] px-[15px] font-medium text-black dark:text-white whitespace-nowrap max-w-[200px] truncate">
                    {txn.description}
                    <span className="block text-xs text-gray-400 font-normal mt-1">
                      {txn.categories?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className={`py-[12px] px-[15px] font-bold whitespace-nowrap ${txn.type === 'income' ? 'text-green-600' : 'text-black dark:text-white'}`}>
                    {txn.type === 'income' ? '+' : ''}{formatCurrency(txn.amount)}
                  </td>
                  <td className="py-[12px] px-[15px] whitespace-nowrap">
                    <span className={`inline-block px-[8px] py-[2px] text-[10px] font-semibold rounded-full ${getStatusClass(txn)}`}>
                      {getStatusLabel(txn)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-[20px] text-center text-gray-400">
                  No recent transactions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
