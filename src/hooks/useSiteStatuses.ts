
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteStatus {
  site_name: string;
  status: string;
}

export const useSiteStatuses = (userId?: string) => {
  const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiteStatuses = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('customer_site_statuses')
          .select('*')
          .eq('customer_id', userId);

        if (error) {
          console.error('Error fetching site statuses:', error);
          return;
        }

        const statusArray = data || [];
        setSiteStatuses(statusArray);
      } catch (error) {
        console.error('Error in fetchSiteStatuses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteStatuses();
  }, [userId]);

  return { siteStatuses, isLoading };
};
