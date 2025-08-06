
import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusTable } from "./StatusTable";
import { siteConfig } from "./SiteConfig";
import { useGuideOpener } from "@/hooks/useGuideOpener";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";
import { cn } from "@/lib/utils";

interface SiteStatus {
  site_name: string;
  status: string;
}

interface StatusCardProps {
  siteStatuses: SiteStatus[];
  isLoading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  siteStatuses,
  isLoading
}) => {
  const { language } = useLanguage();
  const { handleRemoveSite } = useGuideOpener();

  return (
    <Card 
      id="status-widget"
      className={cn(
        "bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325] transition-colors duration-200",
        "transition-all duration-300"
      )}
    >
      <div>
        <h2 className="text-lg font-semibold text-[#000000] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Status' : 'Status'}
        </h2>
        <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-6 md:mb-10">
          {language === 'sv' ? 'Din synlighet på upplysningssidor' : 'Your visibility on search sites'}
        </p>
      </div>
      <div className="mt-2">
        <StatusTable 
          siteStatuses={siteStatuses} 
          sites={siteConfig} 
          onRemoveSite={handleRemoveSite} 
        />
      </div>
    </Card>
  );
};
