"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const ActiveEmptyState: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0c1427] rounded-lg border border-dashed border-gray-200 dark:border-[#172036]">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 relative inline-block">
            {/* Using an icon or illustration here */}
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto text-primary-600">
                <span className="material-symbols-outlined !text-5xl">rocket_launch</span>
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 -left-2 w-3 h-3 bg-green-400 rounded-full"></div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Taxwise
        </h1>
        
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          Let's get your finances sorted. Upload your bank statement to see your income, expenses, and tax deductibles instantly.
        </p>

        <Link
          href="/dashboard/uploads/create"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-lg font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <span className="material-symbols-outlined">upload_file</span>
          Upload Your First Statement
        </Link>

        {/* Value Props / Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#15203c]">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">analytics</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">1. Auto-Analysis</h3>
                <p className="text-sm text-gray-500">We categorize every transaction using AI and local tax rules.</p>
            </div>
            
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#15203c]">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">savings</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2. Find Deductibles</h3>
                <p className="text-sm text-gray-500">Discover business expenses you can legally write off.</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#15203c]">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">summarize</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">3. Tax Report</h3>
                <p className="text-sm text-gray-500">Get a clear, ready-to-file summary for your accountant.</p>
            </div>
        </div>
        
        {/* Optional Demo Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#172036]">
            <p className="text-sm text-gray-400">
                Just want to look around? <span className="text-primary-500 cursor-pointer hover:underline">View Demo Dashboard</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveEmptyState;
