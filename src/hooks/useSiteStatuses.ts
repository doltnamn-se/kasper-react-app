
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

export const useSiteStatuses = (userId?: string) => {
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSiteStatuses = async () => {
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
  };

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
          fetchSiteStatuses(); // Refetch all statuses when any change occurs
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
  }, [userId]);

  return { siteStatuses, isLoading };
};
