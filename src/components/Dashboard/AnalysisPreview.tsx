import React from "react";
import Link from "next/link";

const AnalysisPreview: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-[10px] shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h3 className="text-lg font-bold text-black dark:text-white">
          Analysis Overview
        </h3>
        <Link
          href="/dashboard/analysis"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View Full Analysis
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-[30px]">
        {/* Placeholder for Chart */}
        <div className="relative w-[180px] h-[180px] flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <path
              className="text-gray-100 dark:text-gray-800"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Segment 1: Transport (46%) */}
            <path
              className="text-purple-600"
              strokeDasharray="46, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
             {/* Segment 2: Food (30%) */}
             <path
              className="text-blue-500"
              strokeDasharray="30, 100"
              strokeDashoffset="-46"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-black dark:text-white">46%</span>
            <span className="text-xs text-gray-500">Transport</span>
          </div>
        </div>

        <div className="flex-grow">
          <h4 className="text-base font-semibold text-black dark:text-white mb-[10px]">
            Spending Insight
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-[20px] leading-relaxed">
            Transportation and utilities account for <span className="font-bold text-black dark:text-white">46%</span> of your expenses this month. This is higher than your average of 30%.
          </p>

          <div className="space-y-[12px]">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-purple-600"></span>
                <span className="text-gray-600 dark:text-gray-300">Transportation</span>
              </div>
              <span className="font-medium text-black dark:text-white">₦145,000</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-blue-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Food & Dining</span>
              </div>
              <span className="font-medium text-black dark:text-white">₦94,500</span>
            </div>
             <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full bg-gray-200 dark:bg-gray-700"></span>
                <span className="text-gray-600 dark:text-gray-300">Others</span>
              </div>
              <span className="font-medium text-black dark:text-white">₦75,200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPreview;
