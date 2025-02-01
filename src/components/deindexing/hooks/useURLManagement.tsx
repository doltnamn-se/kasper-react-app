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
      const url = urls.find(u => u.id === urlId);
      if (!url?.customer?.id) return;

      await updateUrlStatus(urlId, newStatus, url.customer.id);
      await createStatusNotification(url.customer.id, newStatus);
      await refetch();
      showSuccessToast();
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      showErrorToast();
    }
  };

  return { urls, handleStatusChange };
};