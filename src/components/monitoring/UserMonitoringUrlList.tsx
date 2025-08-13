
import { MonitoringUrl } from "@/types/monitoring-urls";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { extractSiteName } from "@/utils/urlUtils";

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
  const [processingApprove, setProcessingApprove] = useState<Record<string, boolean>>({});
  const [processingReject, setProcessingReject] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  
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
      setProcessingApprove(prev => ({ ...prev, [urlId]: true }));
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
      setProcessingApprove(prev => ({ ...prev, [urlId]: false }));
    }
  };

  const handleReject = async (urlId: string) => {
    try {
      setProcessingReject(prev => ({ ...prev, [urlId]: true }));
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
      setProcessingReject(prev => ({ ...prev, [urlId]: false }));
    }
  };

  if (!monitoringUrls.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="mb-6">
        {language === 'sv' ? 'Nya länkar att granska' : 'New links to review'}
      </h2>
      
      <div className="space-y-3">
        {monitoringUrls.map((url) => (
          <div key={url.id} className="bg-[#fafafa] dark:bg-[#232325] rounded-[12px] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                  {language === 'sv' ? 'URL' : 'URL'}
                </p>
                <span className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] px-3 py-1.5 rounded-[10px] bg-[#d8f1ff] dark:bg-[#0f3c55] inline-block" title={url.url}>
                  {extractSiteName(url.url)}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                  {language === 'sv' ? 'Hittades' : 'Found'}
                </p>
                <p className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff]">
                  {formatTime(url.created_at)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                  {language === 'sv' ? 'Vill du att vi tar bort länken?' : 'Do you want us to remove this link?'}
                </p>
                <div className={`flex ${isMobile ? 'flex-col' : 'gap-3'}`}>
                  <Button
                    onClick={() => handleApprove(url.id)}
                    className={`bg-[#000000] hover:bg-[#333333] text-white dark:bg-[#FFFFFF] dark:hover:bg-[#FFFFFFA6] dark:text-[#000000] ${isMobile ? 'w-full mb-2' : ''}`}
                    disabled={!!processingApprove[url.id] || !!processingReject[url.id]}
                  >
                    {processingApprove[url.id] ? 
                      (language === 'sv' ? 'Behandlar...' : 'Processing...') : 
                      (language === 'sv' ? 'Ja' : 'Yes')}
                  </Button>
                  <Button
                    onClick={() => handleReject(url.id)}
                    variant="outline"
                    className={`bg-[#e0e0e0] hover:bg-[#d0d0d0] border-transparent text-black dark:bg-[#2a2a2b] dark:hover:bg-[#3a3a3b] dark:text-[#FFFFFF] dark:border-transparent ${isMobile ? 'w-full' : ''}`}
                    disabled={!!processingApprove[url.id] || !!processingReject[url.id]}
                  >
                    {processingReject[url.id] ? 
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
