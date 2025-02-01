import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIncomingUrls = () => {
  const { data: incomingUrls, isLoading } = useQuery({
    queryKey: ['incoming-urls'],
    queryFn: async () => {
      console.log('Fetching incoming URLs');
      const { data: urls, error } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incoming URLs:', error);
        throw error;
      }

      console.log('Fetched incoming URLs:', urls);
      return urls;
    }
  });

  return { incomingUrls, isLoading };
};