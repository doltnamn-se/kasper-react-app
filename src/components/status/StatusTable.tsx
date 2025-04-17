
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const getStatusText = (siteName: string) => {
    const siteStatus = siteStatuses.find(status => status.site_name === siteName);
    const status = siteStatus ? siteStatus.status : 'Granskar';
    
    switch (status) {
      case 'Adress dold':
        return language === 'sv' ? 'Adress dold' : 'Address hidden';
      case 'Dold':
        return language === 'sv' ? 'Dold' : 'Hidden';
      case 'Borttagen':
        return language === 'sv' ? 'Borttagen' : 'Removed';
      case 'Synlig':
        return language === 'sv' ? 'Synlig' : 'Visible';
      case 'Granskar':
      default:
        return language === 'sv' ? 'Granskar' : 'Reviewing';
    }
  };

  const getSpinnerColor = (siteName: string) => {
    const siteStatus = siteStatuses.find(status => status.site_name === siteName);
    const status = siteStatus ? siteStatus.status : 'Granskar';
    
    switch (status) {
      case 'Synlig':
        return "#ea384c"; // Red for visible
      case 'Granskar':
        return "#8E9196"; // Grey for reviewing
      case 'Adress dold':
        return "#FFC107"; // Amber yellow for address hidden
      case 'Dold':
      case 'Borttagen':
      default:
        return "#20f922"; // Keep green for all other statuses
    }
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
          const siteStatus = siteStatuses.find(status => status.site_name === site.name);
          const status = siteStatus ? siteStatus.status : 'Granskar';
          
          return (
            <TableRow key={site.name} className="!hover:bg-transparent border-none py-2 md:py-4">
              <TableCell className="py-2 md:py-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <img 
                    src={site.icon} 
                    alt={site.name} 
                    className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                  />
                  <span className="text-xs md:text-sm font-medium">{site.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-2 md:py-4">
                <div className="flex items-center justify-between gap-1 md:gap-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Spinner 
                      color={getSpinnerColor(site.name)} 
                      size={16} 
                      centerSize={5}  
                      className="md:size-[20px]"
                    />
                    <span className="text-xs md:text-sm">{getStatusText(site.name)}</span>
                  </div>
                  {status === 'Synlig' && (
                    <Badge 
                      variant="static" 
                      className="bg-[#ea384c] text-white dark:text-[#1c1c1e] text-xs cursor-pointer hover:bg-[#c02c3c] py-[0.2rem]"
                      onClick={() => onRemoveSite(site.name)}
                    >
                      {language === 'sv' ? 'Ta bort' : 'Remove'}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
