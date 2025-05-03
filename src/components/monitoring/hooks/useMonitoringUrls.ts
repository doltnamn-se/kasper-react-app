
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitoringUrl, MonitoringUrlStatus } from '@/types/monitoring-urls';
import { 
  fetchAllMonitoringUrls, 
  fetchCustomerMonitoringUrls,
  addMonitoringUrl, 
  updateMonitoringUrlStatus 
} from '../utils/monitoringUrlQueries';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useMonitoringUrls = (customerId?: string) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const queryClient = useQueryClient();
  
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
      await queryClient.invalidateQueries({ queryKey: ['customer-monitoring-urls', customerId] });
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
      await queryClient.invalidateQueries({ queryKey: ['admin-monitoring-urls'] });
      await queryClient.invalidateQueries({ queryKey: ['customer-monitoring-urls', customerId] });
      
      // If this was an approval, also refresh the deindexing URLs
      await queryClient.invalidateQueries({ queryKey: ['incoming-urls'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-urls'] });
    },
    onError: (error: Error) => {
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
    await updateStatusMutation.mutateAsync({ urlId, status, reason });
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
