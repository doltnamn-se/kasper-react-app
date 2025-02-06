
import { TableCell, TableRow } from "@/components/ui/table";
import { URLStatusSelect } from "./URLStatusSelect";
import { formatDistanceToNow } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusStepper } from "./StatusStepper";

interface URLTableRowProps {
  url: {
    id: string;
    url: string;
    status: string;
    created_at: string;
    status_history?: {
      status: string;
      timestamp: string;
    }[];
    customer: {
      id: string;
      profiles: {
        email: string;
      };
    };
  };
  onStatusChange: (urlId: string, newStatus: string) => void;
}

export const URLTableRow = ({ url, onStatusChange }: URLTableRowProps) => {
  const { language } = useLanguage();
  
  console.log('URL data in URLTableRow:', {
    id: url.id,
    status: url.status,
    statusHistory: url.status_history
  });
  
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'sv' ? sv : enUS
    });
  };

  return (
    <TableRow>
      <TableCell className="w-[240px]">
        <a 
          href={url.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-white truncate block"
          title={url.url}
        >
          {url.url}
        </a>
      </TableCell>
      <TableCell className="w-[180px]">
        <span className="truncate block" title={url.customer.profiles.email}>
          {url.customer.profiles.email}
        </span>
      </TableCell>
      <TableCell className="w-[140px] whitespace-nowrap">
        {formatDate(url.created_at)}
      </TableCell>
      <TableCell className="w-[240px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-grow">
            <StatusStepper 
              currentStatus={url.status} 
              statusHistory={url.status_history}
            />
          </div>
          <URLStatusSelect
            currentStatus={url.status}
            urlId={url.id}
            customerId={url.customer.id}
            onStatusChange={(newStatus) => onStatusChange(url.id, newStatus)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

