"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DeductiblesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deductibles, setDeductibles] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .eq("is_deductible", true)
        .order("date", { ascending: false });

      if (data) setDeductibles(data);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const toggleDeductible = async (id: string, currentValue: boolean) => {
    // Optimistic update
    setDeductibles(prev => prev.filter(tx => tx.id !== id)); // Remove from list if untoggled

    const { error } = await supabase
        .from("transactions")
        .update({ is_deductible: !currentValue })
        .eq("id", id);
    
    if (error) {
        console.error("Failed to update deductibility", error);
        // Revert (reload data)
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  const totalDeductible = deductibles.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      <div className="mb-[25px] flex items-center justify-between">
        <div>
            <h2 className="text-xl font-bold text-black dark:text-white">Tax Deductible Expenses</h2>
            <p className="text-gray-500 text-sm">Review expenses flagged as tax-deductible.</p>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-right">
            <span className="block text-xs font-semibold uppercase">Total Deductible</span>
            <span className="text-lg font-bold">₦{totalDeductible.toLocaleString()}</span>
        </div>
      </div>

      <div className="border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#15203c] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-[#172036]">
              <th className="p-[15px]">Date</th>
              <th className="p-[15px]">Description</th>
              <th className="p-[15px]">Category</th>
              <th className="p-[15px]">Amount</th>
              <th className="p-[15px] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {deductibles.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                <td className="p-[15px] text-gray-500 text-sm whitespace-nowrap">{tx.date}</td>
                <td className="p-[15px] font-medium text-black dark:text-white max-w-[300px] truncate">{tx.description}</td>
                <td className="p-[15px]">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tx.categories?.name || 'Uncategorized'}
                    </span>
                </td>
                <td className="p-[15px] font-semibold text-black dark:text-white">₦{Number(tx.amount).toLocaleString()}</td>
                <td className="p-[15px] text-right">
                   <button 
                     onClick={() => toggleDeductible(tx.id, true)}
                     className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-all"
                   >
                     Remove
                   </button>
                </td>
              </tr>
            ))}
            {deductibles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-[30px] text-center text-gray-500">
                  No deductible expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeductiblesPage;
