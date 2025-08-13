
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { Link2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { URLStatusHistory } from "@/types/url-management";
import { formatDistanceStrict, format } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { extractSiteName } from "@/utils/urlUtils";

export const DeindexedLinks = () => {
  const { t, language } = useLanguage();

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
        <div key={url.id} className="bg-[#fafafa] dark:bg-[#232325] rounded-[12px] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                {t('deindexing.url')}
              </p>
              <span className="text-[0.8rem] font-medium text-[#121212] dark:text-[#ffffff] px-3 py-1.5 rounded-[10px] bg-[#d8f1ff] dark:bg-[#0f3c55] inline-block" title={url.url}>
                {extractSiteName(url.url)}
              </span>
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
              <p className="text-xs">
                <span className="bg-[#24cc5b] text-white px-3 py-1.5 rounded-[10px] text-[0.8rem] font-medium">
                  {calculateLeadTime(url.status_history as URLStatusHistory[])}
                </span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
