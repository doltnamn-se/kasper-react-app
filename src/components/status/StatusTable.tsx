
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusActions } from "./StatusActions";
import { getSpinnerColor, getStatusText } from "./SiteConfig";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
}

export const StatusTable: React.FC<StatusTableProps> = ({ 
  siteStatuses, 
  sites,
  onRemoveSite
}) => {
  const { language } = useLanguage();

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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="inline-flex items-center justify-center"
                              aria-label={language === 'sv' ? 'Visa information' : 'Show information'}
                            >
                              <Info className="w-3 h-3 md:w-4 md:h-4 text-[#000000A6] dark:text-[#FFFFFFA6] cursor-help hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
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
