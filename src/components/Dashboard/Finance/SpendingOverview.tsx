"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SpendingOverviewProps {
  data: { label: string; value: number }[];
}

const SpendingOverview: React.FC<SpendingOverviewProps> = ({ data }) => {
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  // Calculate percentages and prepare chart data
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const series = data.map(item => Math.round((item.value / total) * 100));
  const labels = data.map(item => item.label);
  
  // Identify top category
  const topCategory = data.length > 0 ? data[0].label : "";

  const options: ApexOptions = {
    labels: labels,
    colors: ["#9135E8", "#AD63F6", "#BF85FB", "#E9D5FF", "#F3E8FF"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      markers: {
        size: 6,
        shape: "circle",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return val + "%";
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              color: "#64748B",
            },
            value: {
              show: true,
              fontSize: "22px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: "#000",
              offsetY: 5,
              formatter: function (val) {
                return val + "%";
              },
            },
            total: {
              show: true,
              label: topCategory || "Total",
              color: "#64748B",
              formatter: function (w) {
                // Return top category percentage or total
                if (series.length > 0) return series[0] + "%";
                return "0%";
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h5 className="text-lg font-bold text-black dark:text-white !mb-0">
          Spending Breakdown
        </h5>
      </div>
      
      <div className="flex items-center justify-center min-h-[250px]">
        {isChartLoaded && data.length > 0 ? (
          <Chart
            options={options}
            series={series}
            type="donut"
            height={280}
            width={"100%"}
          />
        ) : (
           <div className="text-gray-400 text-sm">No spending data available</div>
        )}
      </div>

      <div className="mt-[10px] text-center">
        {topCategory && (
            <p className="text-sm text-gray-500">
            <span className="font-semibold">{topCategory}</span> is your highest expense category.
            </p>
        )}
      </div>
    </div>
  );
};

export default SpendingOverview;
