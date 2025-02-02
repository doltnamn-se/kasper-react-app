import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const calculateLeadTime = (statusHistory: URLStatusHistory[]) => {
    const startDate = new Date(statusHistory[0]?.timestamp || '');
    const endDate = statusHistory[statusHistory.length - 1]?.timestamp;
    
    if (!endDate) return '';

    return formatDistanceStrict(new Date(endDate), startDate, {
      locale: language === 'sv' ? sv : enUS,
      addSuffix: false
    });
  };

  const getRemovalDate = (statusHistory: URLStatusHistory[]) => {
    const removalEntry = statusHistory.find(entry => entry.status === 'removal_approved');
    if (!removalEntry) return '';

    const date = new Date(removalEntry.timestamp);
    
    if (language === 'sv') {
      return format(date, 'd MMMM yyyy', { locale: sv });
    } else {
      return format(date, 'do MMMM yyyy', { locale: enUS });
    }
  };

  console.log('Component state:', { isLoading, deindexedUrls });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!deindexedUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {language === 'sv' 
          ? "När vi tar bort nya länkar som dykt upp om dig, kommer du att se de här"
          : "When we remove new links that have appeared about you, you will see them here"}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[250px] h-14">{t('deindexing.url')}</TableHead>
          <TableHead className="h-14">
            {language === 'sv' ? 'Borttagningsdatum' : 'Removal date'}
          </TableHead>
          <TableHead className="w-[150px] h-14">
            {language === 'sv' ? 'Ledtid' : 'Lead time'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deindexedUrls.map((url) => (
          <TableRow key={url.id} className="hover:bg-transparent">
            <TableCell className="font-medium w-[250px] max-w-[250px] py-6">
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
            </TableCell>
            <TableCell className="py-6">
              <span className="text-base font-bold text-[#000000] dark:text-[#FFFFFF]">
                {getRemovalDate(url.status_history as URLStatusHistory[])}
              </span>
            </TableCell>
            <TableCell className="py-6">
              <span className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark px-2 py-1 rounded-full text-xs">
                {calculateLeadTime(url.status_history as URLStatusHistory[])}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};