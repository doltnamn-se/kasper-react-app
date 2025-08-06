
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325] transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
        <CardTitle className="text-sm font-medium">
          {t('link.management')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-bold mb-12">
          {isLoading ? "..." : totalLinks}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div className="flex flex-col items-start">
            <span className="text-[#000000] dark:text-[#ffffff] text-xs mb-2 text-left">
              {t('deindexing.status.received')}
            </span>
            <Badge 
              variant="static" 
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 self-start"
            >
              {isLoading ? "..." : receivedLinks}
            </Badge>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[#000000] dark:text-[#ffffff] text-xs mb-2 text-left">
              {t('deindexing.status.case.started')}
            </span>
            <Badge 
              variant="static" 
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 self-start"
            >
              {isLoading ? "..." : caseStartedLinks}
            </Badge>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[#000000] dark:text-[#ffffff] text-xs mb-2 text-left">
              {t('deindexing.status.request.submitted')}
            </span>
            <Badge 
              variant="static" 
              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 self-start"
            >
              {isLoading ? "..." : requestSubmittedLinks}
            </Badge>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[#000000] dark:text-[#ffffff] text-xs mb-2 text-left">
              {t('deindexing.status.removal.approved')}
            </span>
            <Badge 
              variant="static" 
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 self-start"
            >
              {isLoading ? "..." : removalApprovedLinks}
            </Badge>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
