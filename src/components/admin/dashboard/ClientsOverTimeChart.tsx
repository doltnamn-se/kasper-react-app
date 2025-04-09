
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useLanguage } from "@/contexts/LanguageContext";

interface ClientsOverTimeData {
  date: string;
  count: number;
}

interface ClientsOverTimeChartProps {
  data: ClientsOverTimeData[];
}

// Swedish timezone
const SWEDISH_TIMEZONE = "Europe/Stockholm";

export const ClientsOverTimeChart: React.FC<ClientsOverTimeChartProps> = ({ data }) => {
  const { t, language } = useLanguage();
  
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
  const firstDate = data.length > 0 ? new Date(data[0]?.date) : new Date();
  const lastDate = data.length > 0 ? new Date(data[data.length - 1]?.date) : new Date();

  // Format the bottom dates based on language with timezone conversion, showing only the date part
  const formatBottomDate = (date: Date) => {
    return language === 'en'
      ? formatInTimeZone(date, SWEDISH_TIMEZONE, "MMM d, yyyy", { locale: enUS })
      : formatInTimeZone(date, SWEDISH_TIMEZONE, "d MMM yyyy", { locale: sv }).replace('.', '');
  };

  return (
    <div className="w-full h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 5 }}>
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
            fill="#10b981" 
            barSize={4} 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
        <span>{formatBottomDate(firstDate)}</span>
        <span>{formatBottomDate(lastDate)}</span>
      </div>
    </div>
  );
};
