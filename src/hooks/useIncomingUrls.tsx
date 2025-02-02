import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { URLStatusHistory } from "@/types/url-management";

interface IncomingURL {
  id: string;
  url: string;
  status: string;
  created_at: string;
  status_history: URLStatusHistory[];
}

export const useIncomingUrls = () => {
  const { data: incomingUrls, isLoading } = useQuery({
    queryKey: ['incoming-urls'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

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
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incoming URLs:', error);
        return [];
      }

      // Type assertion to ensure status_history is properly typed
      const typedData = data?.map(url => ({
        ...url,
        status_history: (url.status_history || []) as URLStatusHistory[]
      })) as IncomingURL[];

      console.log('Fetched incoming URLs with status history:', typedData);
      return typedData;
    }
  });

  return { incomingUrls, isLoading };
};