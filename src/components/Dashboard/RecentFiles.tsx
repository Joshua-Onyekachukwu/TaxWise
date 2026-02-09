import React from "react";
import Link from "next/link";

const RecentFiles: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-[10px] shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h3 className="text-lg font-bold text-black dark:text-white">
          Your Files & Reports
        </h3>
        <Link
          href="/dashboard/uploads"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-[15px]">
        {/* Latest Upload */}
        <div className="p-[15px] rounded-md border border-gray-100 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
            <div className="flex items-start justify-between mb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <div className="w-[35px] h-[35px] rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                         <i className="material-symbols-outlined !text-[20px]">description</i>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-black dark:text-white">Jan_Statement.csv</h4>
                        <span className="text-xs text-gray-500">Uploaded 2 days ago</span>
                    </div>
                </div>
                <span className="text-[10px] font-medium bg-green-100 text-green-700 px-[8px] py-[2px] rounded-full">Processed</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-[10px]">
                <span>142 Transactions</span>
                <Link href="/dashboard/analysis/1" className="text-purple-600 font-medium hover:underline">
                    View Analysis
                </Link>
            </div>
        </div>

        {/* Pending Review */}
        <div className="p-[15px] rounded-md border border-gray-100 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
            <div className="flex items-start justify-between mb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <div className="w-[35px] h-[35px] rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                         <i className="material-symbols-outlined !text-[20px]">warning</i>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-black dark:text-white">Q4_Expenses.csv</h4>
                        <span className="text-xs text-gray-500">Uploaded 5 days ago</span>
                    </div>
                </div>
                <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-[8px] py-[2px] rounded-full">Needs Review</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-[10px]">
                <span>12 Uncategorized</span>
                <Link href="/dashboard/analysis/2" className="text-orange-600 font-medium hover:underline">
                    Review Now
                </Link>
            </div>
        </div>
        
        {/* Tax Report */}
        <div className="p-[15px] rounded-md border border-gray-100 dark:border-[#172036] bg-gray-50 dark:bg-[#15203c] hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
            <div className="flex items-start justify-between mb-[10px]">
                <div className="flex items-center gap-[10px]">
                    <div className="w-[35px] h-[35px] rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                         <i className="material-symbols-outlined !text-[20px]">picture_as_pdf</i>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-black dark:text-white">2023_Tax_Report.pdf</h4>
                        <span className="text-xs text-gray-500">Generated 1 week ago</span>
                    </div>
                </div>
                 <button className="text-gray-400 hover:text-blue-600">
                    <i className="material-symbols-outlined !text-[20px]">download</i>
                 </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RecentFiles;
