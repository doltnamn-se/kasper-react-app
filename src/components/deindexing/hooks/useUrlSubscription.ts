import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useUrlSubscription = (onUpdate: () => void) => {
  useEffect(() => {
    console.log('Setting up real-time subscription for URLs');
    const channel = supabase
      .channel('admin-urls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'removal_urls'
        },
        (payload) => {
          console.log('URL change detected:', payload);
          onUpdate();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up URL subscription');
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
};