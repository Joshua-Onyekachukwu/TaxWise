"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: { id: string; name: string }[];
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ isOpen, onClose, onSuccess, categories }) => {
  const [pattern, setPattern] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { error } = await supabase.from("rules").insert({
        user_id: user.id,
        match_field: "description",
        match_pattern: pattern,
        action_category_id: categoryId,
        action_deductible: isDeductible,
      });

      if (error) throw error;

      // Reset & Close
      setPattern("");
      setCategoryId("");
      setIsDeductible(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0c1427] w-full max-w-md rounded-lg shadow-xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 className="text-xl font-bold text-black dark:text-white mb-4">Create New Rule</h3>
        
        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              If Description Contains
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Uber, Netflix"
              className="w-full h-[45px] px-3 rounded border border-gray-300 dark:border-[#172036] bg-white dark:bg-[#15203c] text-black dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Set Category To
            </label>
            <select
              required
              className="w-full h-[45px] px-3 rounded border border-gray-300 dark:border-[#172036] bg-white dark:bg-[#15203c] text-black dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deductible"
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              checked={isDeductible}
              onChange={(e) => setIsDeductible(e.target.checked)}
            />
            <label htmlFor="deductible" className="text-sm text-gray-700 dark:text-gray-300 select-none">
              Mark as Tax Deductible?
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-[#172036] rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRuleModal;
