import { useQuery, useQueryClient } from "@tanstack/react-query";
import { URL, URLStatus } from "@/types/url-management";
import { fetchAdminUrls, updateUrlStatus, deleteUrl } from "./utils/urlQueries";
import { useUrlNotifications } from "./useUrlNotifications";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useAdminURLManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Simple query without any automatic refetching or subscriptions
  const { 
    data: urls = [], 
    refetch 
  } = useQuery({
    queryKey: ['admin-urls-static'],
    queryFn: async () => {
      const data = await fetchAdminUrls();
      console.log('useAdminURLManagement - Received URLs:', data);
      return data;
    },
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });

  const { 
    createStatusNotification, 
    showErrorToast 
  } = useUrlNotifications();

  const handleDeleteUrl = async (urlId: string) => {
    try {
      console.log('useAdminURLManagement - Deleting URL:', urlId);
      await deleteUrl(urlId);
      
      // Only update cache optimistically, no refetch
      queryClient.setQueryData(['admin-urls-static'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.filter(item => item.id !== urlId);
      });
      
      toast({
        title: t('success'),
        description: t('success.delete.url'),
      });
    } catch (error) {
      console.error('useAdminURLManagement - Error deleting URL:', error);
      showErrorToast();
    }
  };

  const handleStatusChange = async (urlId: string, newStatus: URLStatus) => {
    try {
      console.log('useAdminURLManagement - handleStatusChange called with:', { 
        urlId, 
        newStatus 
      });

      const url = urls.find(u => u.id === urlId);
      if (!url?.customer?.id) {
        console.log('useAdminURLManagement - No customer ID found for URL:', urlId);
        return;
      }

      // Skip if status hasn't changed
      if (url.status === newStatus) {
        console.log('useAdminURLManagement - Status unchanged, skipping update');
        return;
      }

      console.log('DEBUG: About to apply optimistic update, pagination should stay the same');
      
      // Apply optimistic update immediately
      queryClient.setQueryData(['admin-urls-static'], (oldData: any[]) => {
        if (!oldData) return oldData;
        console.log('DEBUG: Applying optimistic update - preserving pagination state');
        return oldData.map(item => 
          item.id === urlId ? { ...item, status: newStatus } : item
        );
      });

      console.log('useAdminURLManagement - Updating URL status via API');
      const result = await updateUrlStatus(urlId, newStatus, url.customer.id);
      
      if (result) {
        console.log('useAdminURLManagement - Status updated successfully');
        
        // Create notification for the user
        try {
          const { error: notificationError } = await createStatusNotification(
            url.customer.id,
            t('notification.status.update.title'),
            t('notification.status.update.message'),
            'removal'
          );

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          }
        } catch (notifError) {
          console.error('Error creating user notification:', notifError);
        }
        
        toast({
          title: t('success'),
          description: t('success.update.status'),
        });
      }
    } catch (error) {
      console.error('useAdminURLManagement - Error in handleStatusChange:', error);
      
      // Revert optimistic update on error by refreshing data
      refetch();
      showErrorToast();
    }
  };

  return { urls, handleStatusChange, handleDeleteUrl, refetch };
};