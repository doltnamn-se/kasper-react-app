import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

const fetchSiteStatuses = async (userId: string, memberId?: string) => {
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
    throw error;
  }

  console.log('Fetched site statuses:', data);
  return data || [];
};

export const useSiteStatuses = (userId?: string, memberId?: string) => {
  const queryClient = useQueryClient();
  
  const { data: siteStatuses = [], isLoading, refetch } = useQuery({
    queryKey: ['site-statuses', userId, memberId],
    queryFn: () => fetchSiteStatuses(userId!, memberId),
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  useEffect(() => {
    if (!userId) {
      return;
    }
    
    const statusChannel = supabase
      .channel(`customer-site-statuses-${userId}-${memberId || 'main'}`)
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

          if (matchesNew || matchesOld) {
            // Invalidate and refetch the query when relevant changes occur
            queryClient.invalidateQueries({ queryKey: ['site-statuses', userId, memberId] });
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
  }, [userId, memberId, queryClient]);

  return { siteStatuses, isLoading, refetch };
};
