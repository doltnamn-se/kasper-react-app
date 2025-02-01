import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusStepper } from "./StatusStepper";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";

export const IncomingLinks = () => {
  const { t, language } = useLanguage();
  const { incomingUrls, isLoading } = useIncomingUrls();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!incomingUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {t('deindexing.no.incoming.links')}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>{language === 'sv' ? 'Tillagd' : 'Submitted'}</TableHead>
          <TableHead>{language === 'sv' ? 'Status' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomingUrls.map((url) => (
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
              {new Date(url.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <StatusStepper currentStatus={url.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};