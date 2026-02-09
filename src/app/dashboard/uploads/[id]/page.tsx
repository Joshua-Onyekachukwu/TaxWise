"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  is_deductible: boolean;
}

const UploadDetailsPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const supabase = createClient();

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analysis/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: id }),
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Analysis Failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [uploadDetails, setUploadDetails] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Fetch Upload Details
      const { data: upload } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", id)
        .single();
      
      setUploadDetails(upload);

      // Fetch Transactions
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("upload_id", id)
        .order("date", { ascending: false });

      if (txs) {
        setTransactions(txs);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      <div className="mb-[25px] flex items-center justify-between">
        <div>
           <div className="flex items-center gap-[10px] mb-[5px]">
             <Link 
               href="/dashboard/uploads"
               className="text-gray-500 hover:text-primary-500 transition-colors"
             >
               <i className="material-symbols-outlined !text-lg">arrow_back</i>
             </Link>
             <h2 className="text-xl font-bold text-black dark:text-white">
               {uploadDetails?.filename || "Upload Details"}
             </h2>
             <span className="px-[10px] py-[2px] rounded-full text-xs font-medium bg-blue-100 text-blue-700">
               {transactions.length} Transactions
             </span>
           </div>
           <p className="text-xs text-gray-400 pl-[34px]">
             Uploaded on {new Date(uploadDetails?.created_at).toLocaleDateString()}
           </p>
        </div>
        
        <div className="flex gap-[10px]">
          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-primary-500 text-white py-[8px] px-[15px] rounded-md text-sm font-medium hover:bg-primary-400 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <i className="material-symbols-outlined !text-lg">smart_toy</i>
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#15203c] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-[#172036]">
              <th className="p-[15px]">Date</th>
              <th className="p-[15px]">Description</th>
              <th className="p-[15px]">Type</th>
              <th className="p-[15px]">Amount</th>
              <th className="p-[15px]">Status</th>
              <th className="p-[15px] text-right">Deductible?</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                <td className="p-[15px] text-gray-500 text-sm whitespace-nowrap">
                  {tx.date}
                </td>
                <td className="p-[15px] font-medium text-black dark:text-white max-w-[300px] truncate">
                  {tx.description}
                </td>
                <td className="p-[15px]">
                   <span className={`inline-block px-[8px] py-[2px] rounded-md text-xs font-medium ${
                     tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                   }`}>
                     {tx.type}
                   </span>
                </td>
                <td className="p-[15px] font-semibold text-black dark:text-white">
                  {tx.type === 'expense' ? '-' : '+'}₦{Number(tx.amount).toLocaleString()}
                </td>
                <td className="p-[15px]">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tx.status}
                  </span>
                </td>
                <td className="p-[15px] text-right">
                   {tx.is_deductible ? (
                     <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-[2px]">
                       <i className="material-symbols-outlined !text-sm">check_circle</i> Yes
                     </span>
                   ) : (
                     <span className="text-gray-400 text-xs">-</span>
                   )}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-[30px] text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadDetailsPage;
