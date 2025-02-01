import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useURLManagement = () => {
  const { t } = useLanguage();

  const { data: urls = [], refetch } = useQuery({
    queryKey: ['admin-urls'],
    queryFn: async () => {
      console.log('Fetching URLs for admin view');
      const { data, error } = await supabase
        .from('removal_urls')
        .select(`
          id,
          url,
          status,
          created_at,
          customer:customers (
            id,
            profiles (
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching URLs:', error);
        throw error;
      }

      console.log('Fetched URLs:', data);
      return data;
    }
  });

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
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up URL subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleStatusChange = async (urlId: string, newStatus: string) => {
    try {
      console.log('Updating URL status:', { urlId, newStatus });
      
      const { data: currentUrl } = await supabase
        .from('removal_urls')
        .select('status_history, customer_id')
        .eq('id', urlId)
        .single();

      if (!currentUrl) {
        throw new Error('URL not found');
      }

      const statusHistory = currentUrl?.status_history || [];
      const newStatusHistory = [
        ...statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString()
        }
      ];

      const { error: updateError } = await supabase
        .from('removal_urls')
        .update({
          status: newStatus,
          status_history: newStatusHistory,
          current_status: newStatus
        })
        .eq('id', urlId);

      if (updateError) {
        console.error('Error updating URL status:', updateError);
        toast({
          title: t('error'),
          description: t('error.update.status'),
          variant: "destructive",
        });
        return;
      }

      // Create notification for the customer
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: currentUrl.customer_id,
          title: t('notifications.url.status.title'),
          message: t('notifications.url.status.message', { status: newStatus }),
          type: 'removal',
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

      console.log('URL status updated successfully');
      toast({
        title: t('success'),
        description: t('success.update.status'),
      });

    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      toast({
        title: t('error'),
        description: t('error.unexpected'),
        variant: "destructive",
      });
    }
  };

  return { urls, handleStatusChange };
};