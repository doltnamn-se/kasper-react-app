import { MonitoringUrl } from "@/types/monitoring-urls";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [processingUrls, setProcessingUrls] = useState<Record<string, boolean>>({});
  
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

  const handleApprove = async (urlId: string) => {
    try {
      setProcessingUrls(prev => ({ ...prev, [urlId]: true }));
      await onApprove(urlId);
      toast({
        title: language === 'sv' ? 'Tillagd i länkar' : 'Added to links',
        description: language === 'sv' ? 'Länken är mottagen och kommer behandlas inom kort' : 'The link is received and will be processed shortly',
      });
    } catch (error) {
      console.error("Error approving URL:", error);
      toast({
        title: t('error'),
        description: t('monitoring.url.error.approve'),
        variant: "destructive"
      });
    } finally {
      setProcessingUrls(prev => ({ ...prev, [urlId]: false }));
    }
  };

  const handleReject = async (urlId: string) => {
    try {
      setProcessingUrls(prev => ({ ...prev, [urlId]: true }));
      await onReject(urlId);
      toast({
        title: language === 'sv' ? 'Åtgärd slutförd' : 'Action completed',
        description: language === 'sv' ? 'Din förfrågan har skickats' : 'Your request has been submitted',
      });
    } catch (error) {
      console.error("Error rejecting URL:", error);
      toast({
        title: t('error'),
        description: t('monitoring.url.error.reject'),
        variant: "destructive"
      });
    } finally {
      setProcessingUrls(prev => ({ ...prev, [urlId]: false }));
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
                <p className="text-sm text-[#000000] dark:text-[#FFFFFFA6] mt-1">
                  {language === 'sv' ? 'Hittades för ' : 'Found '}
                  {formatTime(url.created_at)}
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
                    onClick={() => handleApprove(url.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={processingUrls[url.id]}
                  >
                    {processingUrls[url.id] ? 
                      (language === 'sv' ? 'Behandlar...' : 'Processing...') : 
                      (language === 'sv' ? 'Ja' : 'Yes')}
                  </Button>
                  <Button
                    onClick={() => handleReject(url.id)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    disabled={processingUrls[url.id]}
                  >
                    {processingUrls[url.id] ? 
                      (language === 'sv' ? 'Behandlar...' : 'Processing...') : 
                      (language === 'sv' ? 'Nej' : 'No')}
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
