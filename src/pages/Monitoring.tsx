
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { HourlyCountdown } from "@/components/monitoring/HourlyCountdown";
import { NewLinks } from "@/components/monitoring/NewLinks";
import { RemovedLinks } from "@/components/monitoring/RemovedLinks";
import { UserMonitoringUrlList } from "@/components/monitoring/UserMonitoringUrlList";
import { useMonitoringUrls } from "@/components/monitoring/hooks/useMonitoringUrls";
import { Spinner } from "@/components/ui/spinner";

const Monitoring = () => {
  const { t, language } = useLanguage();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const {
    monitoringUrls,
    isLoading: isLoadingUrls,
    handleUpdateStatus
  } = useMonitoringUrls(auth.user?.id);

  useEffect(() => {
    // Set loading to false once user auth status is determined
    if (auth.initialized) {
      setIsLoading(false);
    }
  }, [auth.initialized]);

  const handleApprove = async (urlId: string) => {
    try {
      await handleUpdateStatus(urlId, 'approved');
      toast({
        title: language === 'sv' ? 'Tack för ditt svar' : 'Thank you for your response',
        description: language === 'sv' 
          ? 'Vi kommer att hjälpa dig att ta bort länken' 
          : 'We will help you remove this link',
      });
    } catch (error) {
      console.error('Error approving URL:', error);
      toast({
        title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        description: language === 'sv' 
          ? 'Det gick inte att uppdatera länkstatusen' 
          : 'Failed to update link status',
        variant: "destructive",
      });
    }
  };

  const handleReject = async (urlId: string) => {
    try {
      await handleUpdateStatus(urlId, 'rejected');
      toast({
        title: language === 'sv' ? 'Tack för ditt svar' : 'Thank you for your response',
        description: language === 'sv' 
          ? 'Vi kommer inte att ta bort denna länk' 
          : 'We will not remove this link',
      });
    } catch (error) {
      console.error('Error rejecting URL:', error);
      toast({
        title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
        description: language === 'sv' 
          ? 'Det gick inte att uppdatera länkstatusen' 
          : 'Failed to update link status',
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Spinner size={32} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto py-6 px-4 sm:px-0">
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'sv' ? 'Bevakning' : 'Monitoring'}
        </h1>

        <div className="bg-white dark:bg-[#1c1c1e] shadow-sm rounded-md p-4 md:p-6 border border-[#e5e7eb] dark:border-[#232325]">
          <HourlyCountdown />
        </div>

        {!isLoadingUrls && monitoringUrls.length > 0 && (
          <UserMonitoringUrlList 
            monitoringUrls={monitoringUrls}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        <div className="space-y-8">
          <NewLinks />
          <RemovedLinks />
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitoring;
