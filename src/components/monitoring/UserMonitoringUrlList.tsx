
import { MonitoringUrl } from "@/types/monitoring-urls";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";

interface UserMonitoringUrlListProps {
  monitoringUrls: MonitoringUrl[];
  onApprove: (urlId: string) => Promise<void>;
  onReject: (urlId: string) => Promise<void>;
}

export const UserMonitoringUrlList = ({
  monitoringUrls,
  onApprove,
  onReject
}: UserMonitoringUrlListProps) => {
  const { language } = useLanguage();
  
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: language === 'sv' ? sv : enUS
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!monitoringUrls.length) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-lg font-medium">
        {language === 'sv' ? 'Nya länkar att granska' : 'New links to review'}
      </h2>
      
      <div className="space-y-4">
        {monitoringUrls.map((url) => (
          <div 
            key={url.id} 
            className="bg-white dark:bg-[#232325] p-4 rounded-md border border-[#e5e7eb] dark:border-[#363638]"
          >
            <div className="space-y-4">
              <div>
                <a 
                  href={url.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-md"
                >
                  {url.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] mt-1">
                  {language === 'sv' ? 'Tillagd: ' : 'Added: '}{formatTime(url.created_at)}
                </p>
              </div>
              
              <div className="border-t border-[#e5e7eb] dark:border-[#363638] pt-4">
                <p className="text-sm font-medium mb-3">
                  {language === 'sv' 
                    ? 'Vill du att vi tar bort länken?' 
                    : 'Do you want us to remove this link?'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApprove(url.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {language === 'sv' ? 'Ja' : 'Yes'}
                  </Button>
                  <Button
                    onClick={() => onReject(url.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {language === 'sv' ? 'Nej' : 'No'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
