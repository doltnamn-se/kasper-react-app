import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      // Use supabase.functions.invoke instead of raw fetch
      const { data, error } = await supabase.functions.invoke('stripe-webhook', {
        method: 'GET',
      });

      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }

      return data.subscribed;
    },
    retry: false,
  });
};