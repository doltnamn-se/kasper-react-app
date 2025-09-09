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
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    gcTime: Infinity, // Keep in cache
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Allow refetch on mount
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

  const handleBulkStatusUpdate = async () => {
    try {
      console.log('useAdminURLManagement - Starting bulk status update');
      
      // Find URLs with status "received" or "in_progress"
      const urlsToUpdate = urls.filter(url => 
        url.status === 'received' || url.status === 'in_progress'
      );
      
      if (urlsToUpdate.length === 0) {
        toast({
          title: t('success'),
          description: 'Inga URLs att uppdatera',
        });
        return;
      }

      console.log(`Found ${urlsToUpdate.length} URLs to update`);
      
      // Apply optimistic updates for all URLs
      queryClient.setQueryData(['admin-urls-static'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(item => 
          (item.status === 'received' || item.status === 'in_progress') 
            ? { ...item, status: 'request_submitted' } 
            : item
        );
      });

      // Update all URLs
      const updatePromises = urlsToUpdate.map(async (url) => {
        if (!url.customer?.id) {
          console.warn(`No customer ID for URL: ${url.id}`);
          return null;
        }
        
        try {
          const result = await updateUrlStatus(url.id, 'request_submitted', url.customer.id);
          
          // Create notification for the user
          if (result) {
            await createStatusNotification(
              url.customer.id,
              t('notification.status.update.title'),
              t('notification.status.update.message'),
              'removal'
            );
          }
          
          return result;
        } catch (error) {
          console.error(`Error updating URL ${url.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(updatePromises);
      const successCount = results.filter(result => result !== null).length;
      
      toast({
        title: t('success'),
        description: `Uppdaterade ${successCount} av ${urlsToUpdate.length} URLs till "Begäran inskickad"`,
      });
      
    } catch (error) {
      console.error('useAdminURLManagement - Error in bulk status update:', error);
      
      // Revert optimistic updates on error by refreshing data
      refetch();
      showErrorToast();
    }
  };

  return { urls, handleStatusChange, handleDeleteUrl, handleBulkStatusUpdate, refetch };
};