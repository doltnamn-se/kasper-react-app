
import { MonitoringUrl } from "@/types/monitoring-urls";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { extractSiteName } from "@/utils/urlUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  
  const formatTime = (dateString: string) => {
    try {
      const result = formatDistanceToNow(parseISO(dateString), {
        addSuffix: true,
        locale: language === 'sv' ? sv : enUS
      });
      // Capitalize only the first letter
      return result.charAt(0).toUpperCase() + result.slice(1);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: language === 'sv' ? 'Länk kopierad' : 'Link copied',
        description: language === 'sv' ? 'URL:en har kopierats till urklipp' : 'URL has been copied to clipboard',
      });
    });
  };

  const toggleExpanded = (urlId: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(urlId)) {
      newExpanded.delete(urlId);
    } else {
      newExpanded.add(urlId);
    }
    setExpandedUrls(newExpanded);
  };

  const getFullUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
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
      <div className="flex items-center gap-3 mb-6">
        <h2>
          {language === 'sv' ? 'Nya länkar att granska' : 'New links to review'}
        </h2>
        <div className="bg-[#121212] text-white dark:bg-white dark:text-[#121212] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-[0.9rem] font-medium md:pb-[2px]" style={{ paddingRight: '1px' }}>
          {monitoringUrls.length}
        </div>
      </div>
      
      <div className="space-y-3">
        {monitoringUrls.map((url) => (
          <Collapsible key={url.id} open={expandedUrls.has(url.id)} onOpenChange={() => toggleExpanded(url.id)}>
            <div className="bg-[#fafafa] dark:bg-[#232325] rounded-[12px] p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                    {language === 'sv' ? 'Sida' : 'Site'}
                  </p>
                  <a 
                    href={getFullUrl(url.url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] px-3 py-1.5 rounded-[10px] bg-[#d8f1ff] dark:bg-[#0f3c55] inline-block hover:bg-[#c5e9ff] dark:hover:bg-[#0d3447] transition-colors cursor-pointer" 
                    title={url.url}
                  >
                    {extractSiteName(url.url)}
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                    {language === 'sv' ? 'Hittades' : 'Found'}
                  </p>
                  <p className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff]">
                    {formatTime(url.created_at)}
                  </p>
                </div>
                <div className="flex items-end h-full">
                  <CollapsibleTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] px-3 bg-transparent border border-[#dfdfdf] dark:border-[#595959] hover:bg-[#f3f3f3] dark:hover:bg-[#212121] rounded-full"
                    >
                      {language === 'sv' ? 'Visa länk' : 'Show link'}
                      {expandedUrls.has(url.id) ? (
                        <ChevronUp className="h-3 w-3 ml-2" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-2" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                    {language === 'sv' ? 'Vill du att vi tar bort länken?' : 'Do you want us to remove this link?'}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(url.id)}
                      className="h-8 text-[0.8rem] bg-[#000000] hover:bg-[#333333] text-white dark:bg-[#FFFFFF] dark:hover:bg-[#FFFFFFA6] dark:text-[#000000] flex-1"
                      disabled={!!processingApprove[url.id] || !!processingReject[url.id]}
                    >
                      {processingApprove[url.id] ? 
                        (language === 'sv' ? 'Behandlar...' : 'Processing...') : 
                        (language === 'sv' ? 'Ja' : 'Yes')}
                    </Button>
                    <Button
                      onClick={() => handleReject(url.id)}
                      variant="outline"
                      className="h-8 text-[0.8rem] bg-[#e0e0e0] hover:bg-[#d0d0d0] border-transparent text-black dark:bg-[#cccccc] dark:hover:bg-[#b8b8b8] dark:text-[#000000] dark:hover:text-[#000000] dark:border-transparent flex-1"
                      disabled={!!processingApprove[url.id] || !!processingReject[url.id]}
                    >
                      {processingReject[url.id] ? 
                        (language === 'sv' ? 'Behandlar...' : 'Processing...') : 
                        (language === 'sv' ? 'Nej' : 'No')}
                    </Button>
                  </div>
                </div>
              </div>
              <CollapsibleContent className="space-y-2">
                <div className="mt-4 pt-4 border-t border-[#dfdfdf] dark:border-[#2e2e2e]">
                  <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium mb-2">
                    {language === 'sv' ? 'Full URL' : 'Full URL'}
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <p className="text-xs text-[#000000] dark:text-white break-all bg-[#f0f0f0] dark:bg-[#2a2a2a] p-2 rounded flex-1">
                      {url.url}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(url.url)}
                      className="h-8 text-xs px-3 bg-transparent border-[#dfdfdf] dark:border-[#2e2e2e] hover:bg-[#f3f3f3] dark:hover:bg-[#212121] shrink-0 self-start md:self-auto"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {language === 'sv' ? 'Kopiera' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
