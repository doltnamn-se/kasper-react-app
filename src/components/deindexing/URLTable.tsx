
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
    <div className="space-y-4">
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <Table>
            <TableHeader className="bg-[#f3f3f3] dark:bg-[#212121]">
              <TableRow className="border-b border-[#dfdfdf] dark:border-[#2e2e2e] h-[2.5rem]">
                <TableHead className="w-[25%] !px-4 h-[2.5rem] py-0">{t('deindexing.url')}</TableHead>
                <TableHead className="w-[25%] !px-4 h-[2.5rem] py-0">{t('deindexing.customer')}</TableHead>
                <TableHead className="w-[50%] !px-4 h-[2.5rem] py-0">{t('deindexing.status')}</TableHead>
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
      </div>
    </div>
  );
};

