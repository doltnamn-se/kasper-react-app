import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useIncomingUrls = () => {
  const { data: incomingUrls, isLoading, refetch } = useQuery({
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

  useEffect(() => {
    console.log('Setting up real-time subscription for incoming URLs');
    const channel = supabase
      .channel('incoming-urls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'removal_urls'
        },
        (payload) => {
          console.log('URL change detected:', payload);
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for incoming URLs:', status);
      });

    return () => {
      console.log('Cleaning up incoming URLs subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { incomingUrls, isLoading };
};