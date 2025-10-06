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
    <div className="w-full bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#000000] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Bevakning' : 'Monitoring'}
        </h2>
        <Badge 
          variant="outline" 
          className="flex items-center gap-2 font-medium border-[#d4d4d4] dark:border-[#363636] bg-[#fdfdfd] dark:bg-[#242424] text-[0.8rem] py-2"
        >
          <Activity className="w-[0.9rem] h-[0.9rem] text-[#ea384c] animate-icon-fill" />
          <span className="inline-flex items-center whitespace-nowrap">
            {language === 'sv' ? 
              <><span>Skannar</span><span className="inline-block w-[24px]">{dots}</span></> : 
              <><span>Scanning</span><span className="inline-block w-[24px]">{dots}</span></>
            }
          </span>
        </Badge>
      </div>

      {/* Last checked */}
      <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
        {language === 'sv' 
          ? 'Senast kontrollerat CET 12:35 måndag 6 oktober 2025'
          : 'Last checked CET 12:35 Monday October 6, 2025'}
      </p>
    </div>
  );
};
