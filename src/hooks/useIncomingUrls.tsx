import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      console.log('Fetched incoming URLs with status history:', data);
      return data;
    }
  });

  return { incomingUrls, isLoading };
};