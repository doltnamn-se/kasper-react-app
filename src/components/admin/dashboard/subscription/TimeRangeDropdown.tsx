
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define TimeRange type to match the one in AdminDashboard
type TimeRange = 'alltime' | 'ytd' | 'mtd' | '1year' | '4weeks' | '1week';

interface TimeRangeDropdownProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const TimeRangeDropdown = ({ 
  timeRange, 
  onTimeRangeChange 
}: TimeRangeDropdownProps) => {
  const { t } = useLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 border border-[#e5e7eb] dark:border-[#232325] text-xs px-3 flex items-center gap-1"
        >
          {t(`timerange.${timeRange}` as keyof typeof t)}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] shadow-sm text-xs">
        <DropdownMenuItem onClick={() => onTimeRangeChange('alltime')} className="py-2 cursor-pointer">
          {t('timerange.alltime')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('ytd')} className="py-2 cursor-pointer">
          {t('timerange.ytd')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('mtd')} className="py-2 cursor-pointer">
          {t('timerange.mtd')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('1year')} className="py-2 cursor-pointer">
          {t('timerange.1year')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('4weeks')} className="py-2 cursor-pointer">
          {t('timerange.4weeks')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTimeRangeChange('1week')} className="py-2 cursor-pointer">
          {t('timerange.1week')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
