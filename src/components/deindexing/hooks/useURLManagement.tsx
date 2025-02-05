import { useQuery } from "@tanstack/react-query";
import { URL, URLStatus } from "@/types/url-management";
import { fetchAdminUrls, updateUrlStatus } from "./utils/urlQueries";
import { useUrlSubscription } from "./useUrlSubscription";
import { useUrlNotifications } from "./useUrlNotifications";

export const useURLManagement = () => {
  const { 
    data: urls = [], 
    refetch 
  } = useQuery({
    queryKey: ['admin-urls'],
    queryFn: fetchAdminUrls
  });

  const { 
    createStatusNotification, 
    showSuccessToast, 
    showErrorToast 
  } = useUrlNotifications();

  // Set up real-time subscription
  useUrlSubscription(refetch);

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
        showSuccessToast();
      }
    } catch (error) {
      console.error('useURLManagement - Error in handleStatusChange:', error);
      showErrorToast();
    }
  };

  return { urls, handleStatusChange };
};