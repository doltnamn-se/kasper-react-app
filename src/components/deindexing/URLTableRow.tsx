import { TableCell, TableRow } from "@/components/ui/table";
import { URLStatusSelect } from "./URLStatusSelect";
import { formatDistanceToNow } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <TableCell>{url.url}</TableCell>
      <TableCell>{url.customer.profiles.email}</TableCell>
      <TableCell>{formatDate(url.created_at)}</TableCell>
      <TableCell>
        <URLStatusSelect
          currentStatus={url.status}
          urlId={url.id}
          customerId={url.customer.id}
          onStatusChange={(newStatus) => onStatusChange(url.id, newStatus)}
        />
      </TableCell>
    </TableRow>
  );
};