
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { Link2 } from "lucide-react";
import { getStatusText } from "./utils/statusUtils";

export const IncomingLinks = () => {
  const { t, language } = useLanguage();
  const { incomingUrls, isLoading } = useIncomingUrls();

  // Sort URLs by creation date (newest first)
  const sortedUrls = incomingUrls?.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!sortedUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {t('deindexing.no.incoming.links')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sortedUrls.map((url, index) => (
        <div key={url.id}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                {t('deindexing.url')}
              </p>
              <a 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] hover:text-[#000000] dark:hover:text-white truncate block flex items-center gap-2"
                title={url.url}
              >
                <Link2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{url.url}</span>
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                {language === 'sv' ? 'Status' : 'Status'}
              </p>
              <p className="text-xs text-[#000000] dark:text-white capitalize">
                {getStatusText(url.status, t)}
              </p>
            </div>
          </div>
          {index < sortedUrls.length - 1 && (
            <div className="pt-2">
              <Separator className="bg-[#ededed] dark:bg-[#242424]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
