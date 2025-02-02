import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusStepper } from "./StatusStepper";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { URLStatusHistory } from "@/types/url-management";
import { Link2 } from "lucide-react";

export const IncomingLinks = () => {
  const { t, language } = useLanguage();
  const { incomingUrls, isLoading } = useIncomingUrls();

  console.log('Incoming URLs with status history:', incomingUrls?.map(url => ({
    id: url.id,
    status: url.status,
    statusHistory: url.status_history
  })));

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!incomingUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {t('deindexing.no.incoming.links')}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">{t('deindexing.url')}</TableHead>
          <TableHead>{language === 'sv' ? 'Status' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomingUrls.map((url) => (
          <TableRow key={url.id}>
            <TableCell className="font-medium w-[250px] max-w-[250px]">
              <a 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-white truncate block flex items-center gap-2"
                title={url.url}
              >
                <Link2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{url.url}</span>
              </a>
            </TableCell>
            <TableCell>
              <StatusStepper 
                currentStatus={url.status} 
                statusHistory={url.status_history}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};