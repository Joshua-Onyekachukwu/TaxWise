"use client";

import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DeductibleStatusProps {
  series: number[]; // [Deductible, Personal, Review]
}

const DeductibleStatus: React.FC<DeductibleStatusProps> = ({ series }) => {
  const [isChartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  // Ensure we don't pass all zeros which makes chart look weird
  const hasData = series.some(val => val > 0);
  const chartSeries = hasData ? series : [0, 0, 100]; // Fallback if 0

  const options: ApexOptions = {
    labels: ["Deductible", "Personal", "Review"],
    colors: ["#37D80A", "#64748B", "#FD5812"], // Green, Gray, Orange
    legend: {
      show: true,
      position: "bottom",
      fontSize: "12px",
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
      markers: {
        size: 6,
        offsetX: -2,
        offsetY: -0.5,
        shape: "square",
      },
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "50%",
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: "18px",
            fontWeight: 700,
            offsetY: 5,
            color: "#000",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md shadow-sm border border-gray-100 dark:border-[#172036] h-full">
      <div className="flex items-center justify-between mb-[20px]">
        <h5 className="text-lg font-bold text-black dark:text-white !mb-0">
          Deductibles Status
        </h5>
      </div>
      
      <div className="flex items-center justify-center">
        {isChartLoaded && hasData ? (
          <Chart
            options={options}
            series={chartSeries}
            type="radialBar"
            height={260}
            width={"100%"}
          />
        ) : (
             <div className="h-[260px] flex items-center justify-center text-gray-400">
                No data
            </div>
        )}
      </div>

      <div className="text-center mt-[10px]">
        {hasData && (
            <p className="text-sm text-gray-500">
            <span className="font-bold text-green-600">{series[0]}%</span> of your expenses are potentially tax-deductible.
            </p>
        )}
      </div>
    </div>
  );
};

export default DeductibleStatus;
