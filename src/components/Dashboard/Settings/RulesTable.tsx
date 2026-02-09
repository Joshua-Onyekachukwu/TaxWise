"use client";

import React from "react";

interface Rule {
  id: string;
  match_field: string;
  match_pattern: string;
  action_category_id: string;
  action_deductible: boolean;
  categories?: { name: string };
}

interface RulesTableProps {
  rules: Rule[];
  onDelete: (id: string) => void;
}

const RulesTable: React.FC<RulesTableProps> = ({ rules, onDelete }) => {
  return (
    <div className="overflow-x-auto border border-gray-100 dark:border-[#172036] rounded-md">
      <table className="w-full text-left border-collapse bg-white dark:bg-[#0c1427]">
        <thead>
          <tr className="bg-gray-50 dark:bg-[#15203c] text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-[#172036]">
            <th className="p-[15px]">When Description Contains</th>
            <th className="p-[15px]">Set Category To</th>
            <th className="p-[15px]">Mark Deductible?</th>
            <th className="p-[15px] text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rules.length > 0 ? (
            rules.map((rule) => (
              <tr key={rule.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0 hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors">
                <td className="p-[15px] text-black dark:text-white font-medium">
                  "{rule.match_pattern}"
                </td>
                <td className="p-[15px] text-gray-700 dark:text-gray-300">
                  {rule.categories?.name || "Unknown"}
                </td>
                <td className="p-[15px]">
                  {rule.action_deductible ? (
                    <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Yes</span>
                  ) : (
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">No</span>
                  )}
                </td>
                <td className="p-[15px] text-right">
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-[30px] text-center text-gray-400">
                No rules created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RulesTable;
