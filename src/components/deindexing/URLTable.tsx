
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
    <div className="w-full relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">{t('deindexing.url')}</TableHead>
            <TableHead className="w-[25%]">{t('deindexing.customer')}</TableHead>
            <TableHead className="w-[15%]">{t('deindexing.submitted')}</TableHead>
            <TableHead className="w-[25%]">{t('deindexing.status')}</TableHead>
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
    </div>
  );
};
