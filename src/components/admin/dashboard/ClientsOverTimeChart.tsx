import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerRegistrationData } from "@/types/admin";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileChart } from "./chart/MobileChart";
import { DesktopChart } from "./chart/DesktopChart";
import { formatDateWithLocale } from "./chart/dateUtils";

interface ClientsOverTimeData {
  date: string;
  count: number;
}

interface ClientsOverTimeChartProps {
  data: CustomerRegistrationData[] | ClientsOverTimeData[];
}

export const ClientsOverTimeChart: React.FC<ClientsOverTimeChartProps> = ({ data }) => {
  const { language } = useLanguage();
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  // Transform data if needed (to handle both data formats)
  const chartData = data.map(item => {
    // Check if the item is CustomerRegistrationData (has registration_date)
    if ('registration_date' in item) {
      return {
        date: item.registration_date,
        count: item.count
      };
    }
    // Otherwise, it's already in the correct format
    return item;
  });
  
  // Handle mouse enter for the entire chart area
  const handleMouseMove = (e: any) => {
    if (e && e.activeTooltipIndex !== undefined) {
      setActiveBarIndex(e.activeTooltipIndex);
    }
  };

  // Handle mouse leave for the chart area
  const handleMouseLeave = () => {
    setActiveBarIndex(null);
  };

  // On mobile, make the chart wider to allow for scrolling while 
  // containing it within parent container bounds
  const chartWidth = isMobile ? Math.max(600, chartData.length * 10) : '100%';

  // Get first and last date from the data
  const firstDate = chartData.length > 0 ? new Date(chartData[0]?.date) : new Date();
  const lastDate = chartData.length > 0 ? new Date(chartData[chartData.length - 1]?.date) : new Date();

  return (
    <div className="w-full h-[180px] pb-6 overflow-hidden">
      <div className="h-[140px] w-full">
        {isMobile ? (
          <MobileChart
            chartData={chartData}
            chartWidth={chartWidth}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
            activeBarIndex={activeBarIndex}
          />
        ) : (
          <DesktopChart
            chartData={chartData}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
            activeBarIndex={activeBarIndex}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-[#ffffffa6] mt-1 px-1 mb-2">
        <span>{formatDateWithLocale(firstDate, language)}</span>
        <span>{formatDateWithLocale(lastDate, language)}</span>
      </div>
    </div>
  );
};
