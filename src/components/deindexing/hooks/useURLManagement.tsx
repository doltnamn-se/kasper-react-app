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
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0
  });

  const { 
    createStatusNotification, 
    showErrorToast 
  } = useUrlNotifications();

  // Set up real-time subscription
  useUrlSubscription(refetch);

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

      console.log('useURLManagement - Updating URL status');
      const result = await updateUrlStatus(urlId, newStatus, url.customer.id);
      
      if (result) {
        console.log('useURLManagement - Status updated successfully, refreshing data');
        await refetch();
        toast({
          title: t('success'),
          description: t('success.update.status'),
        });
      }
    } catch (error) {
      console.error('useURLManagement - Error in handleStatusChange:', error);
      showErrorToast();
    }
  };

  return { urls, handleStatusChange, handleDeleteUrl };
};
