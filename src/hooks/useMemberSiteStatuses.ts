
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

export const useMemberSiteStatuses = (customerId?: string, memberId?: string) => {
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSiteStatuses = useCallback(async () => {
    if (!customerId || !memberId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', customerId)
        .eq('member_id', memberId);

      if (error) {
        console.error('Error fetching member site statuses:', error);
        return;
      }

      setSiteStatuses(data || []);
    } catch (error) {
      console.error('Error in fetchMemberSiteStatuses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, memberId]);

  useEffect(() => {
    fetchSiteStatuses();

    if (!customerId || !memberId) {
      return () => {};
    }

    const channel = supabase
      .channel('member-customer-site-statuses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_site_statuses',
          filter: `customer_id=eq.${customerId}`
        },
        (payload) => {
          // Restrict updates to the active member only
          const newRow = payload.new as SiteStatus & { member_id?: string };
          const oldRow = payload.old as SiteStatus & { member_id?: string };
          if (payload.eventType === 'INSERT') {
            if ((newRow as any)?.member_id === memberId) {
              setSiteStatuses(prev => [...prev, newRow]);
            }
          } else if (payload.eventType === 'UPDATE') {
            if ((newRow as any)?.member_id === memberId) {
              setSiteStatuses(prev => prev.map(s => s.site_name === newRow.site_name ? newRow : s));
            }
          } else if (payload.eventType === 'DELETE') {
            if ((oldRow as any)?.member_id === memberId) {
              setSiteStatuses(prev => prev.filter(s => s.site_name !== oldRow.site_name));
            }
          } else {
            fetchSiteStatuses();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, memberId, fetchSiteStatuses]);

  return { siteStatuses, isLoading, refetch: fetchSiteStatuses };
};
