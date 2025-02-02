import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLTableRow } from "./URLTableRow";

interface URLTableProps {
  urls: Array<{
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
  }>;
  onStatusChange: (urlId: string, newStatus: string) => void;
}

export const URLTable = ({ urls, onStatusChange }: URLTableProps) => {
  const { t } = useLanguage();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">{t('deindexing.url')}</TableHead>
          <TableHead className="w-[180px]">{t('deindexing.customer')}</TableHead>
          <TableHead className="w-[120px]">{t('deindexing.submitted')}</TableHead>
          <TableHead className="-ml-[30px]">{t('deindexing.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls.map((url) => (
          <URLTableRow
            key={url.id}
            url={url}
            onStatusChange={onStatusChange}
          />
        ))}
      </TableBody>
    </Table>
  );
};