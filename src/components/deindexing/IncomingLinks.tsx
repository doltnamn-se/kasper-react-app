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
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

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
          <TableHead className="w-[45%]">URL</TableHead>
          <TableHead className="w-[25%]">{language === 'sv' ? 'Tillagd' : 'Submitted'}</TableHead>
          <TableHead className="w-[30%]">{language === 'sv' ? 'Status' : 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomingUrls.map((url) => (
          <TableRow key={url.id}>
            <TableCell className="font-medium align-middle">
              <a 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {url.url}
              </a>
            </TableCell>
            <TableCell className="align-middle">
              {`${language === 'sv' ? 'ungefär ' : 'about '}${
                formatDistanceToNow(new Date(url.created_at), {
                  addSuffix: false,
                  locale: language === 'sv' ? sv : undefined
                })
              }${language === 'sv' ? ' sedan' : ' ago'}`}
            </TableCell>
            <TableCell className="align-middle py-6">
              <StatusStepper currentStatus={url.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};