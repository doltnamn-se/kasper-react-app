
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteStatusBadge } from "@/utils/siteStatusUtils";

export const useCustomerPrivacyScore = (customerId: string) => {
  const siteStatusBadge = useSiteStatusBadge([
    'Eniro',
    'Mrkoll', 
    'Hitta',
    'Merinfo',
    'Ratsit',
    'Birthday',
    'Upplysning'
  ], customerId);

  const { data: customerData } = useQuery({
    queryKey: ['customer-privacy-data', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const [urlsResponse, addressResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customerId),
        supabase.from('customer_checklist_progress')
          .select('street_address')
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      return {
        urls: urlsResponse.data || [],
        addressData: addressResponse.data
      };
    },
    enabled: !!customerId
  });

  const calculateScore = () => {
    if (!customerData) return 0;

    let scores = {
      sites: 0,      // Upplysningssidor - 25% if "Dold"
      urls: 0,       // Länkar - 25% if "Inga länkar" or "Länkar borttagna"
      monitoring: 25, // Bevakning - Always 25% (always active)
      address: 0     // Adresslarm - 25% if active
    };

    // Check site status
    if (siteStatusBadge.variant === 'green') {
      scores.sites = 25;
    }

    // Check URLs status
    if (customerData.urls) {
      const allRemoved = customerData.urls.every(url => url.status === 'removal_approved');
      if (!customerData.urls.length || allRemoved) {
        scores.urls = 25;
      }
    } else {
      scores.urls = 25;
    }

    // Check Address status
    if (customerData.addressData?.street_address) {
      scores.address = 25;
    }

    return scores.sites + scores.urls + scores.monitoring + scores.address;
  };

  return { calculateScore };
};
