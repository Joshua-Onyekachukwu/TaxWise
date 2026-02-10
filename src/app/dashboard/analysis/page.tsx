"use client";

import React, { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalysisContent: React.FC = () => {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get("uploadId");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ income: number[], expense: number[], net: number[], categories: string[] }>({ income: [], expense: [], net: [], categories: [] });
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("transactions")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (uploadId) {
        query = query.eq("upload_id", uploadId);
      }

      const { data } = await query;

      if (data) {
        setTransactions(data);
        processChartData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, uploadId]);

  const processChartData = (data: any[]) => {
    // Group by Month
    const monthlyStats: Record<string, { income: number, expense: number, net: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    data.forEach(tx => {
        const date = new Date(tx.date);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        
        // Use "MMM YY"
        const label = `${monthName} ${date.getFullYear().toString().slice(2)}`;

        if (!monthlyStats[label]) monthlyStats[label] = { income: 0, expense: 0, net: 0 };
        
        if (tx.type === 'income') {
            monthlyStats[label].income += Number(tx.amount);
        } else {
            monthlyStats[label].expense += Number(tx.amount);
        }
        monthlyStats[label].net = monthlyStats[label].income - monthlyStats[label].expense;
    });

    // Sort labels chronologically
    const sortedLabels = Object.keys(monthlyStats).sort((a, b) => {
        const [mA, yA] = a.split(' ');
        const [mB, yB] = b.split(' ');
        const dateA = new Date(`20${yA}-${mA}-01`);
        const dateB = new Date(`20${yB}-${mB}-01`);
        return dateA.getTime() - dateB.getTime();
    });

    const incomeSeries = sortedLabels.map(l => monthlyStats[l].income);
    const expenseSeries = sortedLabels.map(l => monthlyStats[l].expense);
    const netSeries = sortedLabels.map(l => monthlyStats[l].net);

    setMonthlyData({ categories: sortedLabels, income: incomeSeries, expense: expenseSeries, net: netSeries });
  };

  const chartOptions: ApexOptions = {
    chart: { type: 'line', stacked: false, toolbar: { show: false } },
    colors: ["#37D80A", "#FD5812", "#605DFF"],
    dataLabels: { enabled: false },
    stroke: { width: [0, 0, 3], curve: 'smooth' },
    xaxis: { categories: monthlyData.categories },
    yaxis: { labels: { formatter: (val) => "₦" + (val / 1000).toFixed(0) + "k" } },
    tooltip: { y: { formatter: (val) => "₦" + val.toLocaleString() } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
    legend: { position: 'top' }
  };

  const series = [
    { name: 'Income', type: 'column', data: monthlyData.income },
    { name: 'Expenses', type: 'column', data: monthlyData.expense },
    { name: 'Net Income', type: 'line', data: monthlyData.net }
  ];

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[25px] rounded-md min-h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center mb-[25px]">
        <h2 className="text-xl font-bold text-black dark:text-white">
            {uploadId ? "Analysis Result" : "Financial Analysis"}
        </h2>
        {uploadId && (
            <a href="/dashboard/analysis" className="text-sm text-primary-500 hover:underline">
                View All History
            </a>
        )}
      </div>

      {/* Tax Readiness Callout */}
      <div className="mb-[30px] bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-[25px] text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
          <h3 className="text-xl font-bold mb-[5px]">Tax Readiness Check</h3>
          <p className="opacity-90 max-w-[500px]">
             You have analyzed your cash flow. Now let's see how much you can save.
             We've identified potential deductions that could reduce your tax liability.
          </p>
        </div>
        <a 
          href="/dashboard/reports" 
          className="mt-[15px] md:mt-0 bg-white text-purple-600 py-[10px] px-[25px] rounded-md font-bold hover:bg-gray-100 transition-all shadow-md"
        >
          View Tax Report
        </a>
      </div>

      {/* Monthly Trend Chart */}
      <div className="mb-[30px] border border-gray-100 dark:border-[#172036] rounded-md p-[20px]">
        <h3 className="text-lg font-semibold mb-[15px]">Monthly Cash Flow</h3>
        {monthlyData.categories.length > 0 ? (
            <Chart options={chartOptions} series={series} type="bar" height={350} />
        ) : (
            <p className="text-center text-gray-400 py-10">No data available for charts.</p>
        )}
      </div>

      {/* Top Merchants / Descriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px]">
        <div>
            <h3 className="text-lg font-semibold mb-[15px]">Largest Transactions</h3>
            <div className="border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#15203c]">
                        <tr>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions
                            .filter(t => t.type === 'expense')
                            .sort((a, b) => b.amount - a.amount)
                            .slice(0, 5)
                            .map(tx => (
                            <tr key={tx.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0">
                                <td className="p-3 truncate max-w-[200px]">{tx.description}</td>
                                <td className="p-3 text-right font-medium">₦{Number(tx.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-[15px]">Income Sources</h3>
            <div className="border border-gray-100 dark:border-[#172036] rounded-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-[#15203c]">
                        <tr>
                            <th className="p-3">Source</th>
                            <th className="p-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions
                            .filter(t => t.type === 'income')
                            .sort((a, b) => b.amount - a.amount)
                            .slice(0, 5)
                            .map(tx => (
                            <tr key={tx.id} className="border-b border-gray-100 dark:border-[#172036] last:border-0">
                                <td className="p-3 truncate max-w-[200px]">{tx.description}</td>
                                <td className="p-3 text-right font-medium text-green-600">₦{Number(tx.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>}>
      <AnalysisContent />
    </Suspense>
  );
};

export default AnalysisPage;
