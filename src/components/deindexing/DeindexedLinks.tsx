
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { Link2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { URLStatusHistory } from "@/types/url-management";
import { formatDistanceStrict, format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { extractSiteName } from "@/utils/urlUtils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const DeindexedLinks = () => {
  const { t, language } = useLanguage();
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  const { data: deindexedUrls, isLoading } = useQuery({
    queryKey: ['deindexed-urls'],
    queryFn: async () => {
      console.log('Fetching deindexed URLs...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No session found');
        return [];
      }

      const { data, error } = await supabase
        .from('removal_urls')
        .select(`
          id,
          url,
          status,
          created_at,
          status_history
        `)
        .eq('customer_id', session.user.id)
        .eq('status', 'removal_approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deindexed URLs:', error);
        return [];
      }

      console.log('Fetched deindexed URLs:', data);
      return data;
    }
  });

  // Sort URLs by creation date (newest first)
  const sortedUrls = deindexedUrls?.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getRemovalDate = (statusHistory: URLStatusHistory[] | undefined | null) => {
    if (!statusHistory || !Array.isArray(statusHistory)) return '';
    
    const removalEntry = statusHistory.find(entry => entry.status === 'removal_approved');
    if (!removalEntry) return '';

    const date = new Date(removalEntry.timestamp);
    
    if (language === 'sv') {
      return format(date, 'd MMMM yyyy', { locale: sv });
    } else {
      return format(date, 'MMMM do yyyy', { locale: enUS });
    }
  };

  const calculateLeadTime = (statusHistory: URLStatusHistory[] | undefined | null) => {
    if (!statusHistory || !Array.isArray(statusHistory) || statusHistory.length === 0) return '';
    
    const startDate = new Date(statusHistory[0]?.timestamp || '');
    const endDate = statusHistory[statusHistory.length - 1]?.timestamp;
    
    if (!endDate) return '';

    return formatDistanceStrict(new Date(endDate), startDate, {
      locale: language === 'sv' ? sv : enUS,
    });
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
        {language === 'sv' 
          ? "Dolda länkar kommer att synas här. Lägg till en länk för att komma igång"
          : "Hidden links will appear here. Add a link to get started"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sortedUrls.map((url) => (
        <Collapsible key={url.id} open={expandedUrls.has(url.id)} onOpenChange={() => toggleExpanded(url.id)}>
          <div className="bg-[#fafafa] dark:bg-[#232325] rounded-[12px] p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                  {t('deindexing.url')}
                </p>
                <a 
                  href={url.url} 
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
                  {language === 'sv' ? 'Borttagningsdatum' : 'Removal date'}
                </p>
                <p className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] capitalize">
                  {getRemovalDate(url.status_history as URLStatusHistory[])}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                  {language === 'sv' ? 'Ledtid' : 'Lead time'}
                </p>
                <div>
                  <span className="bg-[#24cc5b] text-white px-3 py-1.5 rounded-[10px] text-[0.8rem] font-medium">
                    {calculateLeadTime(url.status_history as URLStatusHistory[])?.charAt(0).toUpperCase() + calculateLeadTime(url.status_history as URLStatusHistory[])?.slice(1)}
                  </span>
                </div>
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
  );
};
