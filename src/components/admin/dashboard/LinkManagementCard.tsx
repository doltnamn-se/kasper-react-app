
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const LinkManagementCard = () => {
  const { t } = useLanguage();
  const [totalLinks, setTotalLinks] = useState<number>(0);
  const [pendingLinks, setPendingLinks] = useState<number>(0);
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

        // Fetch number of links not in "removal_approved" status
        // These are the "pending" links - links that haven't reached the final status
        const { count: pendingCount, error: pendingError } = await supabase
          .from('removal_urls')
          .select('*', { count: 'exact', head: true })
          .not('status', 'eq', 'removal_approved');

        if (pendingError) {
          console.error('Error fetching pending links:', pendingError);
          return;
        }

        setTotalLinks(totalCount || 0);
        setPendingLinks(pendingCount || 0);
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
        <div className="text-2xl font-bold mb-4">
          {isLoading ? "..." : totalLinks}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('total.links')}:</span>
            <span>{isLoading ? "..." : totalLinks}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('pending.links')}:</span>
            <span>{isLoading ? "..." : pendingLinks}</span>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
