
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusActions } from "./StatusActions";
import { getSpinnerColor, getStatusText } from "./SiteConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SiteStatus {
  site_name: string;
  status: string;
}

interface SiteInfo {
  name: string;
  icon: string;
}

interface StatusTableProps {
  siteStatuses: SiteStatus[];
  sites: SiteInfo[];
  onRemoveSite: (siteName: string) => void;
  isProcessing?: boolean;
}

export const StatusTable: React.FC<StatusTableProps> = ({ 
  siteStatuses, 
  sites, 
  onRemoveSite,
  isProcessing = false
}) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const getSiteStatus = (siteName: string): string => {
    // Handle name variations between config and database
    const dbSiteName = siteName === 'MrKoll' ? 'Mrkoll' : siteName;
    const siteStatus = siteStatuses.find(status => status.site_name === dbSiteName);
    return siteStatus ? siteStatus.status : 'Granskar';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="!hover:bg-transparent border-none">
          <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6] text-xs md:text-sm font-medium">
            {language === 'sv' ? 'Sida' : 'Site'}
          </TableHead>
          <TableHead className="text-[#000000A6] dark:text-[#FFFFFFA6] text-xs md:text-sm font-medium">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => {
          const status = getSiteStatus(site.name);
          
          return (
            <TableRow key={site.name} className="!hover:bg-transparent border-none">
              <TableCell className="py-3 md:py-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <img 
                    src={site.icon} 
                    alt={site.name} 
                    className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                  />
                  <span className="text-xs md:text-sm font-medium">{site.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-3 md:py-4">
                <div className="flex items-center justify-between gap-1 md:gap-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Spinner 
                      color={getSpinnerColor(status)} 
                      size={16} 
                      centerSize={5}  
                      className="md:size-[20px]"
                    />
                    <span className="text-xs md:text-sm">{getStatusText(status, language)}</span>
                    {status === 'Begäran skickad' && (
                      <TooltipProvider>
                        <Tooltip 
                          open={openTooltip === site.name} 
                          onOpenChange={(open) => setOpenTooltip(open ? site.name : null)}
                        >
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="inline-flex items-center justify-center touch-manipulation p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              aria-label={language === 'sv' ? 'Visa information' : 'Show information'}
                              onClick={() => setOpenTooltip(openTooltip === site.name ? null : site.name)}
                            >
                              <Info className="w-4 h-4 text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors" />
                            </button>
                          </TooltipTrigger>
                           <TooltipContent 
                             side={isMobile ? "top" : "left"} 
                             align="center"
                             sideOffset={isMobile ? 10 : 4}
                             className={`z-[9999] ${isMobile ? 'w-[90vw] max-w-none -translate-x-4' : 'max-w-xs'}`}
                           >
                             <p className="text-sm">
                               {language === 'sv' 
                                 ? "Legal begäran är skickad för borttagning av din profil på MrKoll. Deras handläggningstid är ca 3-4 veckor."
                                 : "Legal request has been sent for removal of your profile on MrKoll. Their processing time is approximately 3-4 weeks."
                               }
                             </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                    <StatusActions
                      status={status}
                      siteName={site.name}
                      onRemoveSite={onRemoveSite}
                      isProcessing={isProcessing}
                    />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
