"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  is_deductible: boolean;
  deductible_confidence: number;
  categories: { name: string };
  upload_id: string;
}

const DeductiblesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [deductibles, setDeductibles] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'likely' | 'confirmed'>('likely');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all potential deductibles (true) or likely ones (confidence > 0)
    // Actually, we want to fetch EVERYTHING that IS deductible OR has high confidence to be one?
    // Let's simplified: 
    // "Likely" = is_deductible=true AND deductible_confidence < 1 (System guessed)
    // "Confirmed" = is_deductible=true AND deductible_confidence = 1 (User confirmed)
    // OR we can just use a 'status' field if we had one. 
    // For now, let's assume all 'is_deductible=true' are in the list.
    // We can add a 'confirmed' flag or just use confidence.
    // Let's use `deductible_confidence`: 
    // < 0.9 = Likely (System)
    // >= 0.9 = Confirmed (User/Rule)

    const { data } = await supabase
      .from("transactions")
      .select("*, categories(name)")
      .eq("user_id", user.id)
      .eq("is_deductible", true)
      .order("date", { ascending: false });

    if (data) setDeductibles(data as any);
    setLoading(false);
  };

  const likelyDeductibles = deductibles.filter(tx => (tx.deductible_confidence || 0) < 0.9);
  const confirmedDeductibles = deductibles.filter(tx => (tx.deductible_confidence || 0) >= 0.9);

  const currentList = activeTab === 'likely' ? likelyDeductibles : confirmedDeductibles;

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action: 'confirm' | 'reject') => {
    if (selectedIds.size === 0) return;

    const updates = Array.from(selectedIds).map(async (id) => {
        if (action === 'confirm') {
            return supabase.from("transactions").update({ deductible_confidence: 1.0 }).eq("id", id);
        } else {
            return supabase.from("transactions").update({ is_deductible: false, deductible_confidence: 0 }).eq("id", id);
        }
    });

    await Promise.all(updates);
    
    // Trigger re-analysis for one of the uploads (optimization: group by upload_id)
    // For MVP, just trigger for the first one found to refresh summaries.
    const sampleId = Array.from(selectedIds)[0];
    const tx = deductibles.find(t => t.id === sampleId);
    if (tx?.upload_id) {
         fetch('/api/analysis/run', { method: 'POST', body: JSON.stringify({ uploadId: tx.upload_id }) });
    }

    // Refresh local state
    fetchData();
    setSelectedIds(new Set());
    router.refresh();
  };
  
  const handleSingleAction = async (id: string, action: 'confirm' | 'reject') => {
      if (action === 'confirm') {
          await supabase.from("transactions").update({ deductible_confidence: 1.0 }).eq("id", id);
      } else {
          await supabase.from("transactions").update({ is_deductible: false, deductible_confidence: 0 }).eq("id", id);
      }
      
      // Trigger background refresh
      const tx = deductibles.find(t => t.id === id);
      if (tx?.upload_id) {
           fetch('/api/analysis/run', { method: 'POST', body: JSON.stringify({ uploadId: tx.upload_id }) });
      }

      fetchData();
      router.refresh();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  const totalDeductible = deductibles.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const estTaxSaved = totalDeductible * 0.15;

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      {/* Header Stats */}
      <div className="mb-[30px] grid grid-cols-1 md:grid-cols-2 gap-[25px]">
        <div className="bg-purple-600 p-[25px] rounded-xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
                <h2 className="text-purple-100 text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                    <i className="material-symbols-outlined !text-lg">account_balance_wallet</i>
                    Total Deductible Expenses
                </h2>
                <p className="text-4xl font-bold tracking-tight">₦{totalDeductible.toLocaleString()}</p>
                <p className="text-purple-200 text-xs mt-2">Approved business expenses for tax year</p>
            </div>
        </div>
        <div className="bg-green-600 p-[25px] rounded-xl shadow-lg text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative z-10">
                <h2 className="text-green-100 text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                    <i className="material-symbols-outlined !text-lg">savings</i>
                    Estimated Tax Savings
                </h2>
                <p className="text-4xl font-bold tracking-tight">₦{estTaxSaved.toLocaleString()}</p>
                <p className="text-green-200 text-xs mt-2">Potential cash saved (~15% rate)</p>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 dark:border-[#172036] mb-[20px]">
          <button 
            onClick={() => setActiveTab('likely')}
            className={`pb-3 px-5 font-medium text-sm transition-all relative ${activeTab === 'likely' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              Review Needed 
              {likelyDeductibles.length > 0 && <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{likelyDeductibles.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('confirmed')}
            className={`pb-3 px-5 font-medium text-sm transition-all relative ${activeTab === 'confirmed' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              Confirmed
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{confirmedDeductibles.length}</span>
          </button>
      </div>

      {/* Actions Toolbar */}
      {selectedIds.size > 0 && (
          <div className="mb-4 bg-gray-50 dark:bg-[#15203c] p-3 rounded-lg flex items-center justify-between animate-fade-in">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                  <button onClick={() => handleBulkAction('reject')} className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded text-red-600 hover:bg-red-50">Reject All</button>
                  <button onClick={() => handleBulkAction('confirm')} className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700">Confirm All</button>
              </div>
          </div>
      )}

      {/* Table */}
      <div className="border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#15203c] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-[#172036]">
              <th className="p-[15px] w-[50px]">
                  <input type="checkbox" 
                    onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(currentList.map(t => t.id)));
                        else setSelectedIds(new Set());
                    }}
                    checked={currentList.length > 0 && selectedIds.size === currentList.length}
                  />
              </th>
              <th className="p-[15px]">Date</th>
              <th className="p-[15px]">Description</th>
              <th className="p-[15px]">Category</th>
              <th className="p-[15px]">Amount</th>
              <th className="p-[15px]">Confidence</th>
              <th className="p-[15px] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((tx) => (
              <tr key={tx.id} className={`border-b border-gray-100 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors ${selectedIds.has(tx.id) ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                <td className="p-[15px]">
                    <input type="checkbox" checked={selectedIds.has(tx.id)} onChange={() => toggleSelection(tx.id)} />
                </td>
                <td className="p-[15px] text-gray-500 text-sm whitespace-nowrap">{tx.date}</td>
                <td className="p-[15px] font-medium text-black dark:text-white max-w-[250px] truncate">
                    {tx.description}
                </td>
                <td className="p-[15px]">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tx.categories?.name || 'Uncategorized'}
                    </span>
                </td>
                <td className="p-[15px] font-semibold text-black dark:text-white">₦{Number(tx.amount).toLocaleString()}</td>
                <td className="p-[15px]">
                    {tx.deductible_confidence >= 0.9 ? (
                        <span className="text-green-600 text-xs font-bold flex items-center gap-1"><i className="material-symbols-outlined !text-sm">verified</i> Confirmed</span>
                    ) : (
                         <span className="text-orange-500 text-xs font-bold flex items-center gap-1"><i className="material-symbols-outlined !text-sm">warning</i> Likely</span>
                    )}
                </td>
                <td className="p-[15px] text-right">
                   <div className="flex items-center justify-end gap-2">
                       {activeTab === 'likely' && (
                           <button onClick={() => handleSingleAction(tx.id, 'confirm')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirm">
                               <i className="material-symbols-outlined !text-lg">check_circle</i>
                           </button>
                       )}
                       <button onClick={() => handleSingleAction(tx.id, 'reject')} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Reject (Personal)">
                           <i className="material-symbols-outlined !text-lg">cancel</i>
                       </button>
                   </div>
                </td>
              </tr>
            ))}
            {currentList.length === 0 && (
              <tr>
                <td colSpan={7} className="p-[40px] text-center text-gray-500">
                  <div className="flex flex-col items-center">
                      <i className="material-symbols-outlined !text-4xl mb-2 text-gray-300">inbox</i>
                      <p>No {activeTab} deductibles found.</p>
                  </div>
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
