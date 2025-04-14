
import React from "react";
import { TooltipProps } from "recharts";
import { formatInTimeZone } from "date-fns-tz";
import { sv, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

// Swedish timezone
const SWEDISH_TIMEZONE = "Europe/Stockholm";

interface CustomTooltipProps extends TooltipProps<number, string> {}

export const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  const { t, language } = useLanguage();

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
