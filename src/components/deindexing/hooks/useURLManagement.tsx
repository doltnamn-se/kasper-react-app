
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { URL, URLStatus } from "@/types/url-management";
import { fetchAdminUrls, updateUrlStatus, deleteUrl } from "./utils/urlQueries";
import { useUrlSubscription } from "./useUrlSubscription";
import { useUrlNotifications } from "./useUrlNotifications";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useURLManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: urls = [], 
    refetch 
  } = useQuery({
    queryKey: ['admin-urls'],
    queryFn: async () => {
      const data = await fetchAdminUrls();
      console.log('useURLManagement - Received URLs:', data);
      return data;
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Keep in cache indefinitely
    // Remove refetchInterval completely - no automatic polling
  });

  const { 
    createStatusNotification, 
    showErrorToast 
  } = useUrlNotifications();

  // Remove real-time subscription for admin view to prevent pagination resets
  // useUrlSubscription(handleRealtimeUpdate);

  const handleDeleteUrl = async (urlId: string) => {
    try {
      console.log('useURLManagement - Deleting URL:', urlId);
      await deleteUrl(urlId);
      
      // Invalidate and refetch to update UI
      await queryClient.invalidateQueries({ queryKey: ['admin-urls'] });
      toast({
        title: t('success'),
        description: t('success.delete.url'),
      });
    } catch (error) {
      console.error('useURLManagement - Error deleting URL:', error);
      showErrorToast();
    }
  };

  const handleStatusChange = async (urlId: string, newStatus: URLStatus) => {
    try {
      console.log('useURLManagement - handleStatusChange called with:', { 
        urlId, 
        newStatus 
      });

      const url = urls.find(u => u.id === urlId);
      if (!url?.customer?.id) {
        console.log('useURLManagement - No customer ID found for URL:', urlId);
        return;
      }

      console.log('useURLManagement - Current URL data:', url);

      // Skip if status hasn't changed
      if (url.status === newStatus) {
        console.log('useURLManagement - Status unchanged, skipping update');
        return;
      }

      console.log('DEBUG: About to apply optimistic update, current pageIndex should be preserved');
      
      // Optimistically update the cache immediately
      queryClient.setQueryData(['admin-urls'], (oldData: any[]) => {
        if (!oldData) return oldData;
        console.log('DEBUG: Applying optimistic update - preserving pagination');
        return oldData.map(item => 
          item.id === urlId ? { ...item, status: newStatus } : item
        );
      });

      console.log('useURLManagement - Updating URL status');
      const result = await updateUrlStatus(urlId, newStatus, url.customer.id);
      
      if (result) {
        console.log('useURLManagement - Status updated successfully');
        
        // Create notification for the user when status is updated by admin
        try {
          console.log('useURLManagement - Creating notification with explicit removal type');
          const { error: notificationError } = await createStatusNotification(
            url.customer.id,
            t('notification.status.update.title'),
            t('notification.status.update.message'),
            'removal' // Explicitly set type to 'removal' to ensure email notifications work
          );

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          } else {
            console.log('Successfully created notification for the user');
          }
        } catch (notifError) {
          console.error('Error creating user notification:', notifError);
        }
        
        // Don't invalidate queries immediately to preserve pagination
        // The real-time subscription will handle updates from other users
        
        toast({
          title: t('success'),
          description: t('success.update.status'),
        });
      }
    } catch (error) {
      console.error('useURLManagement - Error in handleStatusChange:', error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['admin-urls'] });
      showErrorToast();
    }
  };

  return { urls, handleStatusChange, handleDeleteUrl };
};
