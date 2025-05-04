
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScanningStatusBadgeProps {
  isScanning: boolean;
  dots: string;
  pendingUrlsCount: number;
}

export const ScanningStatusBadge = ({ isScanning, dots, pendingUrlsCount }: ScanningStatusBadgeProps) => {
  const { language } = useLanguage();

  const getStatusText = () => {
    if (pendingUrlsCount === 0) {
      return language === 'sv' ? 'Inga nya träffar på Google' : 'No new hits on Google';
    }
    if (pendingUrlsCount === 1) {
      return language === 'sv' ? '1 ny träff på Google' : '1 new hit on Google';
    }
    return language === 'sv' 
      ? `${pendingUrlsCount} nya träffar på Google` 
      : `${pendingUrlsCount} new hits on Google`;
  };

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-2 mt-2 font-medium border-[#d4d4d4] dark:border-[#363636] bg-[#fdfdfd] dark:bg-[#242424] text-[0.8rem] py-2 transition-all duration-300 ease-in-out ${isScanning ? 'w-[120px]' : 'w-[200px]'}`}
    >
      <div className="relative w-[0.9rem] h-[0.9rem]">
        <Activity className="w-full h-full absolute inset-0 text-transparent" />
        <Activity 
          className={`w-full h-full absolute inset-0 ${isScanning ? 'text-[#ea384c] animate-icon-fill' : 'text-[#000000A6] dark:text-[#FFFFFFA6]'}`} 
        />
      </div>
      <span className="inline-flex items-center whitespace-nowrap">
        {isScanning ? 
          (language === 'sv' ? 
            <><span>Skannar</span><span className="inline-block w-[24px]">{dots}</span></> : 
            <><span>Scanning</span><span className="inline-block w-[24px]">{dots}</span></>
          ) :
          getStatusText()
        }
      </span>
    </Badge>
  );
};
