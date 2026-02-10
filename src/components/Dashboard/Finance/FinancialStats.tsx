"use client";

import React from "react";

interface FinancialStatsProps {
  stats: {
    totalIncome: number;
    totalExpenses: number;
    deductibleTotal: number;
    estTaxSaved: number;
  };
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return "₦" + amount.toLocaleString();
  };

  const statsData = [
    {
      title: "Total Income",
      value: formatCurrency(stats.totalIncome),
      icon: "attach_money",
      trend: "increase", // You can calculate trend if you have previous month data
      trendValue: "+0%", // Placeholder
      bgClass: "text-success-600 bg-success-50",
      trendClass: "text-success-700 border-success-300 bg-success-100",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats.totalExpenses),
      icon: "account_balance_wallet",
      trend: "decrease",
      trendValue: "-0%",
      bgClass: "text-purple-600 bg-purple-50",
      trendClass: "text-success-700 border-success-300 bg-success-100",
    },
    {
      title: "Tax Deductibles",
      value: formatCurrency(stats.deductibleTotal),
      icon: "savings",
      trend: "increase",
      trendValue: "+0%",
      bgClass: "text-orange-600 bg-orange-50",
      trendClass: "text-success-700 border-success-300 bg-success-100",
    },
    {
      title: "Est. Tax Saved",
      value: formatCurrency(stats.estTaxSaved),
      icon: "verified",
      trend: "increase",
      trendValue: "15%",
      bgClass: "text-green-600 bg-green-50",
      trendClass: "text-green-700 border-green-300 bg-green-100",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px] mb-[25px]">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036]"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {stat.title}
                </span>
                <h5 className="!mb-0 !mt-[5px] !text-[24px] font-bold text-black dark:text-white">
                  {stat.value}
                </h5>
              </div>
              <div
                className={`w-[50px] h-[50px] flex items-center justify-center rounded-full ${stat.bgClass}`}
              >
                <i className="material-symbols-outlined !text-[24px]">{stat.icon}</i>
              </div>
            </div>
            
            {/* Trend UI kept but values are placeholders for now */}
            <div className="mt-[15px] flex items-center gap-[10px] opacity-50">
              <span
                className={`inline-block px-[8px] py-[2px] border text-xs font-medium rounded-full ${stat.trendClass}`}
              >
                {stat.trendValue}
              </span>
              <span className="block text-xs text-gray-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FinancialStats;
