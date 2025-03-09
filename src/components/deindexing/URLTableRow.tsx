
import { TableCell, TableRow } from "@/components/ui/table";
import { URLStatusSelect } from "./URLStatusSelect";
import { getStatusText } from "./utils/statusUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
  onDelete: (urlId: string) => void;
}

export const URLTableRow = ({ url, onStatusChange, onDelete }: URLTableRowProps) => {
  const { t } = useLanguage();
  
  return (
    <TableRow className="bg-[#f8f8f8] dark:bg-[#171717] border-b border-[#ededed] dark:border-[#242424] hover:bg-[#f3f3f3] dark:hover:bg-[#212121]">
      <TableCell className="w-[20%] !px-4">
        <a 
          href={url.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-white break-all block"
          title={url.url}
        >
          {url.url}
        </a>
      </TableCell>
      <TableCell className="w-[20%] !px-4">
        <span className="text-black dark:text-white truncate block" title={url.customer.profiles.email}>
          {url.customer.profiles.email}
        </span>
      </TableCell>
      <TableCell className="w-[35%] !px-4">
        <span className="text-black dark:text-white capitalize">
          {getStatusText(url.status, t)}
        </span>
      </TableCell>
      <TableCell className="w-[15%] !px-4">
        <URLStatusSelect
          currentStatus={url.status}
          urlId={url.id}
          customerId={url.customer.id}
          onStatusChange={(newStatus) => onStatusChange(url.id, newStatus)}
        />
      </TableCell>
      <TableCell className="w-[10%] !px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(url.id)}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
