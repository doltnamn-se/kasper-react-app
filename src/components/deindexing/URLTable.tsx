
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLTableRow } from "./URLTableRow";
import { URLTableToolbar } from "./URLTableToolbar";
import { useState } from "react";

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
  const [globalFilter, setGlobalFilter] = useState("");

  const filteredUrls = urls.filter((url) => {
    if (!globalFilter) return true;
    const searchTerm = globalFilter.toLowerCase();
    return (
      url.url.toLowerCase().includes(searchTerm) ||
      url.customer.profiles.email.toLowerCase().includes(searchTerm) ||
      url.status.toLowerCase().includes(searchTerm)
    );
  });

  const handleRefresh = () => {
    // Refresh logic can be implemented here if needed
    console.log("Refresh clicked");
  };

  return (
    <div className="space-y-4">
      <URLTableToolbar
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onRefresh={handleRefresh}
      />
      <div className="border border-[#dfdfdf] dark:border-[#2e2e2e]">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <Table>
            <TableHeader className="bg-[#f3f3f3] dark:bg-[#212121]">
              <TableRow className="border-b border-[#dfdfdf] dark:border-[#2e2e2e] h-[2.5rem]">
                <TableHead className="w-[20%] !px-4 h-[2.5rem] py-0">{t('deindexing.url')}</TableHead>
                <TableHead className="w-[20%] !px-4 h-[2.5rem] py-0">{t('deindexing.customer')}</TableHead>
                <TableHead className="w-[45%] !px-4 h-[2.5rem] py-0">{t('deindexing.status')}</TableHead>
                <TableHead className="w-[15%] !px-4 h-[2.5rem] py-0">Change Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUrls.map((url) => (
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
