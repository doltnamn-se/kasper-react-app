
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteStatusBadge } from "@/utils/siteStatusUtils";

export const useCustomerPrivacyScore = (customerId: string) => {
  // Use the same site list and logic as the user's privacy score
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

    console.log('Admin calculating privacy score for customer:', customerId);
    console.log('Site status badge:', siteStatusBadge);
    console.log('Customer data:', customerData);

    let scores = {
      sites: 0,      // Upplysningssidor - 25% if "Dold"
      urls: 0,       // Länkar - 25% if "Inga länkar" or "Länkar borttagna"  
      monitoring: 25, // Bevakning - Always 25% (always active)
      address: 0     // Adresslarm - 25% if active
    };

    // Check site status - using same logic as user's dashboard
    if (siteStatusBadge.variant === 'green') {
      scores.sites = 25;
      console.log('Site status is green, adding 25 points');
    } else {
      console.log('Site status is not qualifying for points:', siteStatusBadge);
    }

    // Check URLs status - using same logic as user's dashboard
    if (customerData.urls) {
      const allRemoved = customerData.urls.every(url => url.status === 'removal_approved');
      if (!customerData.urls.length || allRemoved) {
        scores.urls = 25;
        console.log('URLs are complete, adding 25 points');
      } else {
        console.log('URLs not complete:', customerData.urls);
      }
    } else {
      scores.urls = 25; // No URLs is considered complete
      console.log('No URLs found, adding 25 points');
    }

    // Check Address status - using same logic as user's dashboard
    if (customerData.addressData?.street_address) {
      scores.address = 25;
      console.log('Address is set, adding 25 points');
    } else {
      console.log('No address set');
    }

    const totalScore = scores.sites + scores.urls + scores.monitoring + scores.address;
    console.log('Individual scores:', scores);
    console.log('Total admin score:', totalScore);

    return totalScore;
  };

  return { calculateScore };
};
