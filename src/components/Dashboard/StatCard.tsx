import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  iconName?: string;
  iconColor?: string;
  iconBg?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendValue,
  iconName,
  iconColor = "text-purple-600",
  iconBg = "bg-purple-100",
}) => {
  return (
    <div className="bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-[10px] shadow-sm border border-gray-100 dark:border-[#172036]">
      <div className="flex justify-between items-start mb-[15px]">
        <div>
          <span className="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-[5px]">
            {title}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            {value}
          </h3>
        </div>
        {iconName && (
          <div
            className={`w-[45px] h-[45px] rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
          >
            <i className={`material-symbols-outlined !text-[24px]`}>
              {iconName}
            </i>
          </div>
        )}
      </div>
      
      {(subValue || trendValue) && (
        <div className="flex items-center gap-[10px] text-sm">
          {trendValue && (
            <span
              className={`flex items-center gap-[2px] font-medium ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {trend === "up" && (
                <i className="material-symbols-outlined !text-[16px]">trending_up</i>
              )}
              {trend === "down" && (
                <i className="material-symbols-outlined !text-[16px]">trending_down</i>
              )}
              {trendValue}
            </span>
          )}
          {subValue && (
            <span className="text-gray-400 dark:text-gray-500">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
