
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { Link2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { URLStatusHistory } from "@/types/url-management";
import { formatDistanceStrict, format } from "date-fns";
import { sv, enUS } from "date-fns/locale";

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
    <div className="space-y-4">
      {sortedUrls.map((url, index) => (
        <div key={url.id}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
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
                {language === 'sv' ? 'Borttagningsdatum' : 'Removal date'}
              </p>
              <p className="text-xs text-[#000000] dark:text-white capitalize">
                {getRemovalDate(url.status_history as URLStatusHistory[])}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-medium">
                {language === 'sv' ? 'Ledtid' : 'Lead time'}
              </p>
              <p className="text-xs">
                <span className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark px-3 py-1.5 rounded-full text-xs font-semibold">
                  {calculateLeadTime(url.status_history as URLStatusHistory[])}
                </span>
              </p>
            </div>
          </div>
          {index < sortedUrls.length - 1 && (
            <Separator className="bg-[#ededed] dark:bg-[#242424]" />
          )}
        </div>
      ))}
    </div>
  );
};
