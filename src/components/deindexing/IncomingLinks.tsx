import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

export const IncomingLinks = () => {
  const { t } = useLanguage();

  const { data: incomingUrls, isLoading } = useQuery({
    queryKey: ['incoming-urls'],
    queryFn: async () => {
      console.log('Fetching incoming URLs...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('customer_id', session.user.id)
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incoming URLs:', error);
        throw error;
      }

      console.log('Fetched incoming URLs:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!incomingUrls?.length) {
    return (
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {t('deindexing.no.incoming.links')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {incomingUrls.map((url) => (
        <div 
          key={url.id} 
          className="flex items-center justify-between p-4 bg-white dark:bg-[#1c1c1e] rounded-md border border-[#e5e7eb] dark:border-[#232325]"
        >
          <a 
            href={url.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            {url.url}
            <ExternalLink className="h-4 w-4" />
          </a>
          <span className="text-sm text-gray-500">
            {new Date(url.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};