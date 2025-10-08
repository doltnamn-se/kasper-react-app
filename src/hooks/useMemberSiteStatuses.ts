import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

const fetchMemberSiteStatuses = async (customerId: string, memberId: string) => {
  const { data, error } = await supabase
    .from('customer_site_statuses')
    .select('*')
    .eq('customer_id', customerId)
    .eq('member_id', memberId);

  if (error) {
    console.error('Error fetching member site statuses:', error);
    throw error;
  }

  return data || [];
};

export const useMemberSiteStatuses = (customerId?: string, memberId?: string) => {
  const queryClient = useQueryClient();
  
  const { data: siteStatuses = [], isLoading, refetch } = useQuery({
    queryKey: ['member-site-statuses', customerId, memberId],
    queryFn: () => fetchMemberSiteStatuses(customerId!, memberId!),
    enabled: !!customerId && !!memberId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!customerId || !memberId) {
      return;
    }

    const channel = supabase
      .channel(`member-site-statuses-${customerId}-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_site_statuses',
          filter: `customer_id=eq.${customerId}`
        },
        (payload) => {
          const newRow = payload.new as SiteStatus & { member_id?: string };
          const oldRow = payload.old as SiteStatus & { member_id?: string };
          const affectsMember = (newRow as any)?.member_id === memberId || 
                                (oldRow as any)?.member_id === memberId;
          
          if (affectsMember) {
            queryClient.invalidateQueries({ queryKey: ['member-site-statuses', customerId, memberId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, memberId, queryClient]);

  return { siteStatuses, isLoading, refetch };
};
