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
  
  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'sv' ? sv : enUS
    });
  };

  return (
    <TableRow>
      <TableCell className="max-w-[200px] truncate">{url.url}</TableCell>
      <TableCell className="max-w-[200px] truncate">{url.customer.profiles.email}</TableCell>
      <TableCell className="whitespace-nowrap">{formatDate(url.created_at)}</TableCell>
      <TableCell className="w-full">
        <div className="flex items-center justify-between gap-4">
          <StatusStepper currentStatus={url.status} />
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