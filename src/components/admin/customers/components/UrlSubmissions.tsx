
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface UrlSubmissionsProps {
  customer: CustomerWithProfile;
}

export const UrlSubmissions = ({ customer }: UrlSubmissionsProps) => {
  const { t } = useLanguage();
  
  // Fetch URLs for this customer
  const { data: urlData } = useQuery({
    queryKey: ['customer-urls', customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('customer_id', customer.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!customer.id
  });
  
  // Fetch URL limits for this customer
  const { data: limitData } = useQuery({
    queryKey: ['url-limits', customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_url_limits')
        .select('*')
        .eq('customer_id', customer.id)
        .single();
        
      if (error) {
        // If no record, assume default values
        if (error.code === 'PGRST116') {
          return { base_limit: 3, additional_urls: 0 };
        }
        throw error;
      }
      return data;
    },
    enabled: !!customer.id
  });
  
  const { usedUrls, totalUrlLimit, isUnlimited } = useMemo(() => {
    const usedUrls = urlData?.length || 0;
    const baseLimit = limitData?.base_limit || 3;
    const additionalUrls = limitData?.additional_urls || 0;
    const totalUrlLimit = baseLimit + additionalUrls;
    const isUnlimited = totalUrlLimit > 10000;
    
    return { usedUrls, totalUrlLimit, isUnlimited };
  }, [urlData, limitData]);

  const displayLimit = isUnlimited ? t('unlimited') : totalUrlLimit.toString();

  return (
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
        {t('url.submissions')}
      </h3>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('total.urls')}</p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {usedUrls}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('urls.available')}</p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {isUnlimited ? displayLimit : `${usedUrls} / ${displayLimit}`}
          </p>
        </div>
      </div>
    </div>
  );
};
