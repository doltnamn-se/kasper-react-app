
import { TableCell, TableRow } from "@/components/ui/table";
import { URLStatusSelect } from "./URLStatusSelect";
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
  console.log('URL data in URLTableRow:', {
    id: url.id,
    status: url.status,
    statusHistory: url.status_history
  });

  return (
    <TableRow>
      <TableCell className="w-[25%]">
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
      <TableCell className="w-[25%]">
        <span className="truncate block" title={url.customer.profiles.email}>
          {url.customer.profiles.email}
        </span>
      </TableCell>
      <TableCell className="w-[50%]">
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

