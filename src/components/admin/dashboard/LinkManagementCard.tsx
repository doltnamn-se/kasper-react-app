
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const LinkManagementCard = () => {
  const { t } = useLanguage();
  const [totalLinks, setTotalLinks] = useState<number>(0);
  const [receivedLinks, setReceivedLinks] = useState<number>(0);
  const [caseStartedLinks, setCaseStartedLinks] = useState<number>(0);
  const [requestSubmittedLinks, setRequestSubmittedLinks] = useState<number>(0);
  const [removalApprovedLinks, setRemovalApprovedLinks] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLinkData = async () => {
      setIsLoading(true);
      try {
        // Fetch total number of links
        const { count: totalCount, error: totalError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error('Error fetching total links:', totalError);
          return;
        }

        // Fetch links with "received" status
        const { count: receivedCount, error: receivedError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'received');

        if (receivedError) {
          console.error('Error fetching received links:', receivedError);
          return;
        }

        // Fetch links with "case_started" status
        const { count: caseStartedCount, error: caseStartedError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'case_started');

        if (caseStartedError) {
          console.error('Error fetching case_started links:', caseStartedError);
          return;
        }

        // Fetch links with "request_submitted" status
        const { count: requestSubmittedCount, error: requestSubmittedError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'request_submitted');

        if (requestSubmittedError) {
          console.error('Error fetching request_submitted links:', requestSubmittedError);
          return;
        }

        // Fetch links with "removal_approved" status
        const { count: removalApprovedCount, error: removalApprovedError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'removal_approved');

        if (removalApprovedError) {
          console.error('Error fetching removal_approved links:', removalApprovedError);
          return;
        }

        setTotalLinks(totalCount || 0);
        setReceivedLinks(receivedCount || 0);
        setCaseStartedLinks(caseStartedCount || 0);
        setRequestSubmittedLinks(requestSubmittedCount || 0);
        setRemovalApprovedLinks(removalApprovedCount || 0);
      } catch (error) {
        console.error('Error in fetchLinkData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkData();
  }, []);

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('link.management')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold mb-12">
          {isLoading ? "..." : totalLinks}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[#000000a6] dark:text-[#ffffffa6]">{t('deindexing.status.received')}:</span>
            <span>{isLoading ? "..." : receivedLinks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[#000000a6] dark:text-[#ffffffa6]">{t('deindexing.status.case.started')}:</span>
            <span>{isLoading ? "..." : caseStartedLinks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[#000000a6] dark:text-[#ffffffa6]">{t('deindexing.status.request.submitted')}:</span>
            <span>{isLoading ? "..." : requestSubmittedLinks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-[#000000a6] dark:text-[#ffffffa6]">{t('deindexing.status.removal.approved')}:</span>
            <span>{isLoading ? "..." : removalApprovedLinks}</span>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
