
import { useState, useEffect } from "react";
import { useMonitoringUrls } from "@/components/monitoring/hooks/useMonitoringUrls";
import { AdminMonitoringUrlForm } from "@/components/monitoring/AdminMonitoringUrlForm";
import { AdminMonitoringUrlList } from "@/components/monitoring/AdminMonitoringUrlList";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminMonitoring = () => {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    document.title = "Admin | Kasper";
  }, []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: customersData = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['all-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, profiles(display_name, email)');
      
      if (error) throw error;
      return data;
    },
  });

  // Transform the data structure to match CustomerWithProfile type
  const customers = customersData.map(c => ({
    id: c.id,
    profile: c.profiles
  }));

  const {
    monitoringUrls,
    isLoading,
    handleAddUrl,
    handleUpdateStatus,
    isAddingUrl,
    refetch
  } = useMonitoringUrls();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const pageTitle = language === 'sv' ? 'Bevakning' : 'Monitoring';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1>
          {pageTitle}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Spinner size={16} color="#000000" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          <span>{language === 'sv' ? 'Uppdatera' : 'Refresh'}</span>
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325]">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">
            {t('monitoring.add.new')}
          </h2>
          
          {isLoadingCustomers ? (
            <div className="flex justify-center py-4">
              <Spinner size={24} />
            </div>
          ) : (
            <AdminMonitoringUrlForm 
              customers={customers} 
              onAddUrl={handleAddUrl} 
              isSubmitting={isAddingUrl}
            />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325]">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">
            {t('monitoring.links')}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size={24} />
            </div>
          ) : (
            <AdminMonitoringUrlList 
              monitoringUrls={monitoringUrls} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMonitoring;
