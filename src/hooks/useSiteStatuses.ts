
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

export const useSiteStatuses = (userId?: string, memberId?: string) => {
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
      console.log(`Fetching site statuses for user: ${userId} member: ${memberId ?? 'main'}`);
      let query = supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', userId);

      if (memberId) {
        query = query.eq('member_id', memberId);
      } else {
        query = query.is('member_id', null);
      }

      const { data, error } = await query;

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
  }, [userId, memberId]);

  useEffect(() => {
    // Initial fetch
    fetchSiteStatuses();

    // Set up real-time subscription for status changes
    if (!userId) {
      console.log('No userId for real-time updates');
      return () => {};
    }
    
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
          const newMemberId = (payload.new as any)?.member_id ?? null;
          const oldMemberId = (payload.old as any)?.member_id ?? null;
          const matchesNew = memberId ? newMemberId === memberId : newMemberId === null;
          const matchesOld = memberId ? oldMemberId === memberId : oldMemberId === null;

          if (payload.eventType === 'INSERT' && matchesNew) {
            setSiteStatuses(prev => [...prev, payload.new as SiteStatus]);
          } else if (payload.eventType === 'UPDATE' && matchesNew) {
            setSiteStatuses(prev => 
              prev.map(status => 
                status.site_name === (payload.new as SiteStatus).site_name 
                  ? (payload.new as SiteStatus) 
                  : status
              )
            );
          } else if (payload.eventType === 'DELETE' && matchesOld) {
            setSiteStatuses(prev => 
              prev.filter(status => status.site_name !== (payload.old as SiteStatus).site_name)
            );
          } else {
            // For other cases or non-matching member updates, refetch to stay consistent
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
