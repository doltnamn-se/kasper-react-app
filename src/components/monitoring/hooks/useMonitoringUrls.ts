
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitoringUrlStatus } from '@/types/monitoring-urls';
import { 
  fetchAllMonitoringUrls, 
  fetchCustomerMonitoringUrls,
  addMonitoringUrl, 
  updateMonitoringUrlStatus,
  setQueryClientReference
} from '../utils/monitoringUrlQueries';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useMonitoringUrls = (customerId?: string) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const queryClient = useQueryClient();
  
  // Set the queryClient reference for the monitoringUrlQueries module
  setQueryClientReference(queryClient);
  
  // Query for fetching monitoring URLs
  const { 
    data: monitoringUrls = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: customerId ? ['customer-monitoring-urls', customerId] : ['admin-monitoring-urls'],
    queryFn: () => customerId ? fetchCustomerMonitoringUrls(customerId) : fetchAllMonitoringUrls(),
  });

  // Mutation for adding a new monitoring URL
  const addMutation = useMutation({
    mutationFn: ({ url, customerId }: { url: string; customerId: string }) => {
      setIsAddingUrl(true);
      return addMonitoringUrl(url, customerId);
    },
    onSuccess: async () => {
      setIsAddingUrl(false);
      toast({
        title: t('success'),
        description: t('monitoring.url.added'),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-monitoring-urls'] });
      if (customerId) {
        await queryClient.invalidateQueries({ queryKey: ['customer-monitoring-urls', customerId] });
      }
    },
    onError: (error: Error) => {
      setIsAddingUrl(false);
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for updating the status of a monitoring URL
  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      urlId, 
      status, 
      reason 
    }: { 
      urlId: string; 
      status: MonitoringUrlStatus; 
      reason?: string 
    }) => {
      return updateMonitoringUrlStatus(urlId, status, reason);
    },
    onSuccess: async () => {
      toast({
        title: t('success'),
        description: t('monitoring.url.updated'),
      });
      
      // Invalidate and refetch all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['admin-monitoring-urls'] });
      if (customerId) {
        await queryClient.invalidateQueries({ queryKey: ['customer-monitoring-urls', customerId] });
      }
    },
    onError: (error: Error) => {
      console.error("Error in updateStatusMutation:", error);
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddUrl = async (url: string, targetCustomerId: string) => {
    await addMutation.mutateAsync({ url, customerId: targetCustomerId });
  };

  const handleUpdateStatus = async (urlId: string, status: MonitoringUrlStatus, reason?: string) => {
    try {
      console.log(`handleUpdateStatus called for URL ${urlId} with status ${status}`);
      await updateStatusMutation.mutateAsync({ urlId, status, reason });
    } catch (error) {
      console.error("Error in handleUpdateStatus:", error);
      // Error is already handled in the mutation's onError callback
    }
  };

  return {
    monitoringUrls,
    isLoading,
    error,
    isAddingUrl,
    handleAddUrl,
    handleUpdateStatus,
    refetch
  };
};
