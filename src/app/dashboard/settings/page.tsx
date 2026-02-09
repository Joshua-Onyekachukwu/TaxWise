"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RulesTable from "@/components/Dashboard/Settings/RulesTable";
import CreateRuleModal from "@/components/Dashboard/Settings/CreateRuleModal";

const SettingsPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Rules
    const { data: rulesData } = await supabase
      .from("rules")
      .select(`
        *,
        categories (name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (rulesData) setRules(rulesData);

    // Fetch Categories for Modal
    const { data: catData } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id);
      
    if (catData) setCategories(catData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    const { error } = await supabase.from("rules").delete().eq("id", id);
    if (!error) {
        setRules(rules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      <h2 className="text-xl font-bold text-black dark:text-white mb-[25px]">Account Settings</h2>

      <div className="max-w-[800px] space-y-[40px]">
        
        {/* Rules Section */}
        <section>
             <div className="flex items-center justify-between mb-[15px] border-b border-gray-100 dark:border-gray-800 pb-[10px]">
                <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">Auto-Categorization Rules</h3>
                    <p className="text-sm text-gray-500">Create rules to automatically categorize transactions and skip AI processing.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 text-white text-sm py-[8px] px-[15px] rounded-md font-medium hover:bg-primary-400 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined !text-sm">add</span>
                    New Rule
                </button>
             </div>
             
             {loading ? (
                 <div className="text-center py-10">Loading...</div>
             ) : (
                 <RulesTable rules={rules} onDelete={handleDeleteRule} />
             )}
        </section>

        {/* Billing Section (Beta) */}
        <section>
             <div className="flex items-center justify-between mb-[15px] border-b border-gray-100 dark:border-gray-800 pb-[10px]">
                <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                        Billing & Subscription 
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Beta</span>
                    </h3>
                    <p className="text-sm text-gray-500">Manage your subscription plan and payment methods.</p>
                </div>
             </div>
             
             <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                 <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                     <i className="material-symbols-outlined text-gray-400">credit_card</i>
                 </div>
                 <h4 className="text-md font-medium text-gray-900 dark:text-white mb-1">Billing is currently disabled</h4>
                 <p className="text-sm text-gray-500 mb-4">You are on the <span className="font-semibold text-primary-600">Free Beta Tier</span>. Enjoy all features on us!</p>
                 <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
                     Manage Subscription
                 </button>
             </div>
        </section>

        {/* Profile Section */}
        <section className="opacity-60 pointer-events-none filter grayscale">
            <h3 className="text-lg font-semibold mb-[15px] border-b border-gray-100 pb-[10px]">Profile (Coming Soon)</h3>
            <div className="grid grid-cols-1 gap-[15px]">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-[5px]">Email</label>
                    <input type="email" disabled value="user@example.com" className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-gray-500 cursor-not-allowed" />
                </div>
            </div>
        </section>

      </div>

      <CreateRuleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        categories={categories}
      />
    </div>
  );
};

export default SettingsPage;
