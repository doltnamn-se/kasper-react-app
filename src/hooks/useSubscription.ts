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

      const response = await fetch('/api/stripe/check-subscription', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      return data.subscribed;
    },
    retry: false,
  });
};