
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import { URLStatusSelect } from "./URLStatusSelect";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { URL } from "@/types/url-management";

interface URLTableRowProps {
  url: URL;
  onStatusChange: (urlId: string, newStatus: string) => void;
  onDelete: (urlId: string) => void;
  isMobile?: boolean;
}

export const URLTableRow = ({ url, onStatusChange, onDelete, isMobile = false }: URLTableRowProps) => {
  const { language } = useLanguage();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received':
        return language === 'sv' ? 'Mottagen' : 'Received';
      case 'in_progress':
        return language === 'sv' ? 'Påbörjad' : 'In Progress';
      case 'completed':
        return language === 'sv' ? 'Slutförd' : 'Completed';
      case 'failed':
        return language === 'sv' ? 'Misslyckad' : 'Failed';
      default:
        return status;
    }
  };

  return (
    <TableRow key={url.id} className="border-b border-[#dfdfdf] dark:border-[#2e2e2e]">
      {!isMobile && (
        <TableCell className="!px-4 py-2">
          <div className="flex items-center gap-2">
            <a
              href={url.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline max-w-[200px] truncate inline-flex items-center gap-1"
            >
              {url.url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </TableCell>
      )}
      
      {!isMobile && (
        <TableCell className="!px-4 py-2">
          {url.customer?.profiles?.email || 'Unknown'}
        </TableCell>
      )}
      
      <TableCell className="!px-4 py-2">
        <span className="text-black dark:text-white">
          {getStatusText(url.status)}
        </span>
      </TableCell>
      
      <TableCell className="!px-4 py-2">
        <URLStatusSelect
          currentStatus={url.status}
          onChange={(newStatus: string) => onStatusChange(url.id, newStatus)}
        />
      </TableCell>
      
      {!isMobile && (
        <TableCell className="!px-4 py-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {language === 'sv' ? 'Är du säker?' : 'Are you sure?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'sv'
                    ? 'Denna åtgärd kan inte ångras. Detta kommer permanent att ta bort URL:en.'
                    : 'This action cannot be undone. This will permanently delete the URL.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'sv' ? 'Avbryt' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(url.id)} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
                  {language === 'sv' ? 'Ta bort' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      )}
    </TableRow>
  );
};
