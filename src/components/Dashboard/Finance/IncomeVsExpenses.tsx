"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface IncomeVsExpensesProps {
  data: { date: string; income: number; expense: number }[];
}

const IncomeVsExpenses: React.FC<IncomeVsExpensesProps> = ({ data }) => {
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  const categories = data.map(d => {
      // Format date YYYY-MM to "Jan", "Feb" etc
      const date = new Date(d.date + "-01");
      return date.toLocaleDateString('en-US', { month: 'short' });
  });
  
  const incomeSeries = data.map(d => d.income);
  const expenseSeries = data.map(d => d.expense);

  const series = [
    {
      name: "Income",
      data: incomeSeries,
    },
    {
      name: "Expenses",
      data: expenseSeries,
    },
  ];

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: ["#37D80A", "#FD5812"], // Green for Income, Orange for Expenses
    plotOptions: {
      bar: {
        columnWidth: "30%",
        borderRadius: 4,
      },
    },
    grid: {
      show: true,
      borderColor: "#F6F7F9",
      strokeDashArray: 4,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      labels: {
        show: true,
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
            if (val >= 1000000) return "₦" + (val / 1000000).toFixed(1) + "M";
            if (val >= 1000) return "₦" + (val / 1000).toFixed(0) + "k";
            return "₦" + val;
        },
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "₦" + val.toLocaleString();
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      fontSize: "13px",
      horizontalAlign: "right",
      markers: {
        size: 6,
        shape: "circle",
      },
    },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h5 className="text-lg font-bold text-black dark:text-white !mb-0">
          Income vs Expenses
        </h5>
        {/* Filter can be wired later */}
        {/* <select className="bg-gray-50 border border-gray-100 text-gray-900 text-xs rounded-md focus:ring-purple-500 focus:border-purple-500 block p-2 dark:bg-[#15203c] dark:border-[#15203c] dark:placeholder-gray-400 dark:text-white">
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select> */}
      </div>
      
      <div className="-ml-[15px]">
        {isChartLoaded && data.length > 0 ? (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={300}
            width={"100%"}
          />
        ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
                No trend data available
            </div>
        )}
      </div>
    </div>
  );
};

export default IncomeVsExpenses;
