import { TableCell, TableRow } from "@/components/ui/table";
import { URLStatusSelect } from "./URLStatusSelect";
import type { StatusStep } from "./URLStatusSelect";

interface URLTableRowProps {
  url: {
    id: string;
    url: string;
    current_status: StatusStep;
    created_at: string;
    customers?: {
      profiles?: {
        email?: string;
        display_name?: string;
      };
    };
  };
  onStatusChange: (urlId: string, newStatus: StatusStep) => void;
  isLoading?: boolean;
}

export const URLTableRow = ({ url, onStatusChange, isLoading }: URLTableRowProps) => {
  return (
    <TableRow key={url.id}>
      <TableCell className="font-medium">
        <a 
          href={url.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {url.url}
        </a>
      </TableCell>
      <TableCell>
        {url.customers?.profiles?.display_name || url.customers?.profiles?.email || 'N/A'}
      </TableCell>
      <TableCell>
        {new Date(url.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <URLStatusSelect
          currentStatus={url.current_status || 'received'}
          onStatusChange={(status) => onStatusChange(url.id, status)}
          isLoading={isLoading}
        />
      </TableCell>
    </TableRow>
  );
};