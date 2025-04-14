import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerRegistrationData } from "@/types/admin";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientsOverTimeData {
  date: string;
  count: number;
}

interface ClientsOverTimeChartProps {
  data: CustomerRegistrationData[] | ClientsOverTimeData[];
}

// Swedish timezone
const SWEDISH_TIMEZONE = "Europe/Stockholm";

export const ClientsOverTimeChart: React.FC<ClientsOverTimeChartProps> = ({ data }) => {
  const { t, language } = useLanguage();
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
  
  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      try {
        const date = new Date(label);
        // Format date using timezone-aware function, but only show the date part
        const formattedDate = language === 'en' 
          ? formatInTimeZone(date, SWEDISH_TIMEZONE, "MMM d, yyyy", { locale: enUS })
          : formatInTimeZone(date, SWEDISH_TIMEZONE, "d MMM yyyy", { locale: sv }).replace('.', '');
        
        return (
          <div className="bg-white dark:bg-[#1c1c1e] p-2 border border-[#e5e7eb] dark:border-[#232325] rounded shadow-sm text-xs">
            <p className="font-medium">{formattedDate}</p>
            <p>{`${t('customers')}: ${payload[0].value}`}</p>
          </div>
        );
      } catch (error) {
        console.error("Error formatting date:", error);
        return null;
      }
    }
    return null;
  };

  // Get first and last date from the data
  const firstDate = chartData.length > 0 ? new Date(chartData[0]?.date) : new Date();
  const lastDate = chartData.length > 0 ? new Date(chartData[chartData.length - 1]?.date) : new Date();

  // Format the bottom dates based on language with timezone conversion, showing only the date part
  const formatBottomDate = (date: Date) => {
    if (isNaN(date.getTime())) {
      return ""; // Return empty string for invalid dates
    }
    
    return language === 'en'
      ? formatInTimeZone(date, SWEDISH_TIMEZONE, "MMM d, yyyy", { locale: enUS })
      : formatInTimeZone(date, SWEDISH_TIMEZONE, "d MMM yyyy", { locale: sv }).replace('.', '');
  };

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

  return (
    <div className="w-full h-[180px] pb-6 overflow-hidden">
      <div className="h-[140px] w-full">
        {isMobile ? (
          <ScrollArea className="h-full w-full overflow-hidden">
            <div style={{ width: `${chartWidth}px`, height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 0, right: 0, left: -20, bottom: 5 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    height={10}
                  />
                  <YAxis 
                    hide={true}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar 
                    dataKey="count" 
                    className="fill-[#10b981]"
                    barSize={4} 
                    radius={2}
                    shape={(props) => {
                      const { x, y, width, height, index } = props;
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          rx={2}
                          ry={2}
                          fill={
                            activeBarIndex === index
                              ? "#3fcf8e" // Light mode hover color for active bar
                              : activeBarIndex !== null
                              ? "#16b674" // Light mode hover color for inactive bars
                              : "#10b981" // Default color
                          }
                          className={`
                            ${activeBarIndex === index
                              ? "dark:fill-[#3ecf8e]" // Dark mode hover color for active bar
                              : activeBarIndex !== null
                              ? "dark:fill-[#006239]" // Dark mode hover color for inactive bars
                              : "dark:fill-[#10b981]"} // Default dark mode color
                            transition-colors duration-300 ease-in-out
                          `}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollArea>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 0, right: 0, left: -20, bottom: 5 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={false}
                height={10}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="count" 
                className="fill-[#10b981]"
                barSize={4} 
                radius={2}
                shape={(props) => {
                  const { x, y, width, height, index } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={2}
                      ry={2}
                      fill={
                        activeBarIndex === index
                          ? "#3fcf8e" // Light mode hover color for active bar
                          : activeBarIndex !== null
                          ? "#16b674" // Light mode hover color for inactive bars
                          : "#10b981" // Default color
                      }
                      className={`
                        ${activeBarIndex === index
                          ? "dark:fill-[#3ecf8e]" // Dark mode hover color for active bar
                          : activeBarIndex !== null
                          ? "dark:fill-[#006239]" // Dark mode hover color for inactive bars
                          : "dark:fill-[#10b981]"} // Default dark mode color
                        transition-colors duration-300 ease-in-out
                      `}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-[#ffffffa6] mt-1 px-1 mb-2">
        <span>{formatBottomDate(firstDate)}</span>
        <span>{formatBottomDate(lastDate)}</span>
      </div>
    </div>
  );
};
