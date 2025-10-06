import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface MonitoringVisualProps {
  language: string;
}

export const MonitoringVisual = ({ language }: MonitoringVisualProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    let count = 0;
    const dotInterval = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);
  return (
    <div className="w-full bg-transparent p-4 md:p-6 rounded-2xl shadow-sm border border-transparent transition-colors duration-200 space-y-6">
      {/* Scanning Badge */}
      <Badge 
        variant="outline" 
        className="flex items-center gap-2 w-fit font-medium border-[#d4d4d4] dark:border-[#363636] bg-[#fdfdfd] dark:bg-[#242424] text-[0.8rem] py-2"
      >
        <Activity className="w-[0.9rem] h-[0.9rem] text-[#ea384c] animate-icon-fill" />
        <span className="inline-flex items-center whitespace-nowrap">
          {language === 'sv' ? 
            <><span>Skannar</span><span className="inline-block w-[24px]">{dots}</span></> : 
            <><span>Scanning</span><span className="inline-block w-[24px]">{dots}</span></>
          }
        </span>
      </Badge>

      {/* Sample link card */}
      <div className="bg-[#fafafa] dark:bg-[#232325] rounded-[12px] p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
              {language === 'sv' ? 'Sida' : 'Site'}
            </p>
            <div className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] px-3 py-1.5 rounded-[10px] bg-[#d8f1ff] dark:bg-[#0f3c55] inline-block">
              Google
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
              {language === 'sv' ? 'Hittades' : 'Found'}
            </p>
            <p className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff]">
              {language === 'sv' ? '2 timmar sedan' : '2 hours ago'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
