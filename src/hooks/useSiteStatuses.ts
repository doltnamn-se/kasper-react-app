
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

export const useSiteStatuses = (userId?: string) => {
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSiteStatuses = useCallback(async () => {
    if (!userId) {
      console.log('No user ID provided to useSiteStatuses');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Fetching site statuses for user: ${userId}`);
      const { data, error } = await supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', userId);

      if (error) {
        console.error('Error fetching site statuses:', error);
        return;
      }

      console.log('Fetched site statuses:', data);
      const statusArray = data || [];
      setSiteStatuses(statusArray);
    } catch (error) {
      console.error('Error in fetchSiteStatuses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Initial fetch
    fetchSiteStatuses();

    // Set up real-time subscription for status changes
    const statusChannel = supabase
      .channel('customer-site-statuses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_site_statuses',
          filter: `customer_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Instead of refetching, update the state directly for better performance
          if (payload.eventType === 'INSERT') {
            setSiteStatuses(prev => [...prev, payload.new as SiteStatus]);
          } else if (payload.eventType === 'UPDATE') {
            setSiteStatuses(prev => 
              prev.map(status => 
                status.site_name === (payload.new as SiteStatus).site_name 
                  ? payload.new as SiteStatus 
                  : status
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSiteStatuses(prev => 
              prev.filter(status => status.site_name !== (payload.old as SiteStatus).site_name)
            );
          } else {
            // For other cases or as a fallback, refetch all statuses
            fetchSiteStatuses();
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
      });

    console.log(`Subscribed to real-time updates for customer_site_statuses (user: ${userId})`);

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(statusChannel);
    };
  }, [userId, fetchSiteStatuses]);

  return { siteStatuses, isLoading, refetch: fetchSiteStatuses };
};
