
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { HourlyCountdown } from "@/components/monitoring/HourlyCountdown";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScanningStatusBadge } from "./ScanningStatusBadge";
import { MonitoringUrl } from "@/types/monitoring-urls";

interface MonitoringPanelProps {
  lastChecked: Date;
  isScanning: boolean;
  dots: string;
  displayName: string;
  pendingUrls: MonitoringUrl[];
  onApprove: (urlId: string) => Promise<void>;
  onReject: (urlId: string) => Promise<void>;
  userId: string | null;
}

export const MonitoringPanel = ({
  lastChecked,
  isScanning,
  dots,
  displayName,
  pendingUrls,
  onApprove,
  onReject,
  userId
}: MonitoringPanelProps) => {
  const { language } = useLanguage();

  const getFormattedDate = () => {
    if (language === 'sv') {
      return `CET ${format(lastChecked, 'HH:mm eeee d MMMM yyyy', { locale: sv })}`;
    }
    return `CET ${format(lastChecked, 'h:mma, EEEE, MMMM d, yyyy', { locale: enUS })}`;
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h2>
          {language === 'sv' ? 'Bevakning' : 'Monitoring'}
        </h2>
        <div className="flex items-center gap-3">
          <HourlyCountdown />
          <div className="flex items-center">
            <Spinner color={isScanning ? "#ea384c" : "#20f922"} size={24} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center space-y-2">
        <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-xs mt-12">
          {language === 'sv' ? 
            `Senast kontrollerat ${getFormattedDate()}` : 
            `Last checked ${getFormattedDate()}`
          }
        </p>
        <p className="text-[#000000] dark:text-white text-lg" style={{ marginBottom: '55px' }}>
          <span className="font-normal">
            {language === 'sv' ? 
              'Bevakar nya sökträffar för ' : 
              'Monitoring new search hits for '
            }
          </span>
          <span className="font-bold">{displayName}</span>
        </p>
        <div className="flex items-center">
          <ScanningStatusBadge 
            isScanning={isScanning} 
            dots={dots} 
            pendingUrlsCount={pendingUrls.length}
          />
        </div>
      </div>
    </div>
  );
};
