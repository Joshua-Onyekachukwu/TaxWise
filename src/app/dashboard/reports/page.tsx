"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Dynamically import charts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    deductibleExpenses: 0,
    taxableIncome: 0,
    estimatedTax: 0,
  });
  const [categoryData, setCategoryData] = useState<{ labels: string[], series: number[] }>({ labels: [], series: [] });

  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transactions } = await supabase
        .from("transactions")
        .select(`
          date,
          description,
          amount,
          type,
          is_deductible,
          status,
          categories (name)
        `)
        .eq("user_id", user.id);

      if (transactions) {
        setTransactionsData(transactions.map((tx: any) => ({
            ...tx,
            category: tx.categories?.name
        })));

        let income = 0;
        let expenses = 0;
        let deductibles = 0;
        let uncategorized = 0;
        const categoryMap: Record<string, number> = {};

        transactions.forEach((tx: any) => {
          const amt = Number(tx.amount);
          const catName = tx.categories?.name || 'Uncategorized';
          
          if (catName === 'Uncategorized') uncategorized++;

          if (tx.type === 'income') {
            income += amt;
          } else {
            expenses += amt;
            if (tx.is_deductible) {
              deductibles += amt;
            }
            
            // Category breakdown - Only for Expenses
            if (catName !== 'Uncategorized') {
              categoryMap[catName] = (categoryMap[catName] || 0) + amt;
            } else {
              // Should we show Uncategorized in breakdown? Yes.
              categoryMap['Uncategorized'] = (categoryMap['Uncategorized'] || 0) + amt;
            }
          }
        });

        // Simple Nigerian Tax Estimation (Hypothetical simplified rules)
        // First 300k exempt, next 300k @ 7%, etc.
        // For MVP, let's use a flat effective rate estimation for display
        const taxable = Math.max(0, income - deductibles); // Simplified: Gross Income - Deductible Expenses (Usually it's Consolidated Relief Allowance etc in NG)
        // Let's assume a simplified "Effective Tax Rate" of roughly 15% for estimation
        const estimatedTax = taxable * 0.15; 

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          deductibleExpenses: deductibles,
          taxableIncome: taxable,
          estimatedTax: estimatedTax
        });
        
        setUncategorizedCount(uncategorized);

        setCategoryData({
          labels: Object.keys(categoryMap),
          series: Object.values(categoryMap)
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const donutOptions: ApexOptions = {
    labels: categoryData.labels,
    colors: ["#605DFF", "#37D80A", "#FD5812", "#5C31D6", "#FFC107"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    plotOptions: {
        pie: {
            donut: {
                size: '65%'
            }
        }
    }
  };

  const handleDownloadPDF = () => {
    if (!transactionsData) return;
    import("@/lib/reports/pdf-generator").then(({ generatePDF }) => {
      generatePDF(stats, transactionsData);
    });
  };

  const handleExportCSV = () => {
    if (!transactionsData) return;
    import("@/lib/reports/csv-generator").then(({ generateCSV }) => {
      const csv = generateCSV(transactionsData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `taxwise-categorized-ledger-${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Active Empty State for Reports
  if (!transactionsData || transactionsData.length === 0) {
      return (
          <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                  <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="material-symbols-outlined text-4xl text-gray-400">description</i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Reports Available</h2>
                  <p className="text-gray-500 mb-8">
                      Upload your first financial statement to generate tax reports and insights.
                  </p>
                  <a 
                      href="/dashboard/uploads/create"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-3 md:text-lg md:px-8 transition-colors"
                  >
                      Upload CSV
                  </a>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] pb-10">
      <div className="mb-[25px] flex flex-col md:flex-row items-center justify-between gap-[15px]">
        <div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-[5px]">Tax Report</h2>
            <p className="text-gray-500 text-sm">Financial summary for the current tax year</p>
            <p className="text-xs text-gray-400 mt-1 italic">Disclaimer: This report is an estimate based on provided data.</p>
        </div>
        <div className="flex gap-[10px]">
            <button 
                onClick={handleExportCSV}
                className="bg-white dark:bg-[#15203c] border border-gray-200 dark:border-[#172036] text-black dark:text-white py-[10px] px-[20px] rounded-md font-medium hover:bg-gray-50 dark:hover:bg-[#1e2a45] transition-all flex items-center gap-[8px]"
            >
                <i className="material-symbols-outlined !text-lg">table_view</i>
                Export CSV
            </button>
            <button 
                onClick={handleDownloadPDF}
                className="bg-primary-500 text-white py-[10px] px-[20px] rounded-md font-medium hover:bg-primary-400 transition-all flex items-center gap-[8px] shadow-sm active:scale-95"
            >
                <i className="material-symbols-outlined !text-lg">picture_as_pdf</i>
                Download PDF
            </button>
        </div>
      </div>

      {/* Tax Readiness Callout */}
      <div className="mb-[30px] bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-[25px] text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
          <h3 className="text-xl font-bold mb-[5px] text-white">Tax Readiness Check</h3>
          <p className="opacity-90 max-w-[500px] text-white">
             You have analyzed your cash flow. Now let's see how much you can save.
             We've identified potential deductions that could reduce your tax liability.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[25px] mb-[25px]">
        {/* Total Income */}
        <div className="bg-white dark:bg-[#0c1427] p-[20px] rounded-md shadow-sm border-l-4 border-primary-500">
            <span className="text-gray-500 text-xs uppercase font-semibold">Total Income</span>
            <h3 className="text-2xl font-bold text-black dark:text-white mt-[5px]">
                ₦{stats.totalIncome.toLocaleString()}
            </h3>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-[#0c1427] p-[20px] rounded-md shadow-sm border-l-4 border-orange-500">
            <span className="text-gray-500 text-xs uppercase font-semibold">Total Expenses</span>
            <h3 className="text-2xl font-bold text-black dark:text-white mt-[5px]">
                ₦{stats.totalExpenses.toLocaleString()}
            </h3>
        </div>

        {/* Deductible Expenses */}
        <div className="bg-white dark:bg-[#0c1427] p-[20px] rounded-md shadow-sm border-l-4 border-green-500">
            <span className="text-gray-500 text-xs uppercase font-semibold">Deductible Expenses</span>
            <h3 className="text-2xl font-bold text-green-600 mt-[5px]">
                ₦{stats.deductibleExpenses.toLocaleString()}
            </h3>
            <span className="text-xs text-gray-400">Tax-Free Spending</span>
        </div>

        {/* Est. Tax Saved - New Hero Metric */}
        <div className="bg-green-50 dark:bg-green-900/20 p-[20px] rounded-md shadow-sm border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-2 mb-1">
                <i className="material-symbols-outlined text-green-600 !text-lg">savings</i>
                <span className="text-green-700 dark:text-green-400 text-xs uppercase font-bold">Est. Tax Saved</span>
            </div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                ₦{(stats.deductibleExpenses * 0.15).toLocaleString()}
            </h3>
            <span className="text-xs text-green-600/80">Money back in your pocket</span>
        </div>

        {/* Est. Tax Liability */}
        <div className="bg-white dark:bg-[#0c1427] p-[20px] rounded-md shadow-sm border-l-4 border-purple-500">
            <span className="text-gray-500 text-xs uppercase font-semibold">Est. Tax Liability</span>
            <h3 className="text-2xl font-bold text-purple-600 mt-[5px]">
                ₦{stats.estimatedTax.toLocaleString()}
            </h3>
            <span className="text-xs text-gray-400">~15% Effective Rate</span>
        </div>
      </div>

      {/* Tax Calculation Breakdown */}
      <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md shadow-sm mb-[25px]">
        <h4 className="text-lg font-bold text-black dark:text-white mb-[20px]">Tax Calculation Breakdown</h4>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#15203c] border-b border-gray-100 dark:border-[#172036]">
                    <tr>
                        <th className="p-[15px] font-semibold text-gray-500">Component</th>
                        <th className="p-[15px] font-semibold text-gray-500 text-right">Value</th>
                        <th className="p-[15px] font-semibold text-gray-500">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#172036]">
                    <tr>
                        <td className="p-[15px] text-black dark:text-white">Total Income</td>
                        <td className="p-[15px] text-right font-medium text-black dark:text-white">₦{stats.totalIncome.toLocaleString()}</td>
                        <td className="p-[15px] text-gray-500">Gross revenue from all sources</td>
                    </tr>
                    <tr>
                        <td className="p-[15px] text-black dark:text-white">Deductible Expenses</td>
                        <td className="p-[15px] text-right font-medium text-green-600">- ₦{stats.deductibleExpenses.toLocaleString()}</td>
                        <td className="p-[15px] text-gray-500">Approved business expenses</td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/10">
                        <td className="p-[15px] font-bold text-black dark:text-white">Taxable Income</td>
                        <td className="p-[15px] text-right font-bold text-blue-600">₦{stats.taxableIncome.toLocaleString()}</td>
                        <td className="p-[15px] text-gray-500">Net income subject to tax</td>
                    </tr>
                    <tr>
                        <td className="p-[15px] text-black dark:text-white">Estimated Tax Rate</td>
                        <td className="p-[15px] text-right font-medium text-black dark:text-white">~15%</td>
                        <td className="p-[15px] text-gray-500">Effective rate estimation (MVP)</td>
                    </tr>
                    <tr className="bg-purple-50 dark:bg-purple-900/10 border-t-2 border-purple-100">
                        <td className="p-[15px] font-bold text-purple-700 dark:text-purple-400">Final Tax Estimate</td>
                        <td className="p-[15px] text-right font-bold text-purple-700 dark:text-purple-400">₦{stats.estimatedTax.toLocaleString()}</td>
                        <td className="p-[15px] text-gray-500">Potential liability</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        {/* Expense Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1427] p-[25px] rounded-md shadow-sm">
            <h4 className="text-lg font-bold text-black dark:text-white mb-[20px]">Expense Breakdown</h4>
            <div className="h-[300px]">
                {categoryData.series.length > 0 ? (
                    <Chart options={donutOptions} series={categoryData.series} type="donut" height={300} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">No expense data available</div>
                )}
            </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md shadow-sm">
            <h4 className="text-lg font-bold text-black dark:text-white mb-[20px]">Tax Insights</h4>
            <ul className="space-y-[15px]">
                <li className="flex gap-[15px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <i className="material-symbols-outlined">check_circle</i>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm text-black dark:text-white">Deductibles Optimized</h5>
                        <p className="text-xs text-gray-500 mt-[2px]">You've identified ₦{stats.deductibleExpenses.toLocaleString()} in business expenses.</p>
                    </div>
                </li>
                <li className="flex gap-[15px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <i className="material-symbols-outlined">trending_up</i>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm text-black dark:text-white">Income Analysis</h5>
                        <p className="text-xs text-gray-500 mt-[2px]">Your income sources are diversified across Freelance and Salary.</p>
                    </div>
                </li>
                <li className="flex gap-[15px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <i className="material-symbols-outlined">warning</i>
                    </div>
                    <div>
                        <h5 className="font-semibold text-sm text-black dark:text-white">Action Required</h5>
                        <p className="text-xs text-gray-500 mt-[2px]">
                            {uncategorizedCount > 0 
                              ? `Review ${uncategorizedCount} uncategorized transactions to maximize your deductions.`
                              : "All transactions are categorized. Great job!"}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
