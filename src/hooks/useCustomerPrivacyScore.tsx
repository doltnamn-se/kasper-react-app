
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerPrivacyScore = (customerId: string) => {
  const { data: customerScore, isLoading } = useQuery({
    queryKey: ['customer-privacy-score', customerId],
    queryFn: async () => {
      if (!customerId) return 0;
      
      console.log('Fetching privacy score for customer:', customerId);
      
      // We'll use the existing privacy score calculation that the user sees
      // by calling the same hooks and logic that usePrivacyScore uses
      
      // First, get the user's incoming URLs
      const { data: incomingUrls } = await supabase
        .from('removal_urls')
        .select('*')
        .eq('customer_id', customerId)
        .eq('display_in_incoming', true);

      // Get the user's address data
      const { data: addressData } = await supabase
        .from('customer_checklist_progress')
        .select('street_address')
        .eq('customer_id', customerId)
        .maybeSingle();

      // Get site statuses - using the same logic as the user
      const { data: siteStatuses } = await supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', customerId);

      console.log('Fetched data for score calculation:', {
        incomingUrls: incomingUrls?.length || 0,
        addressData,
        siteStatuses: siteStatuses?.length || 0
      });

      // Calculate the score using the same logic as usePrivacyScore
      let scores = {
        sites: 0,      // Upplysningssidor - 25% if "Dold"
        urls: 0,       // Länkar - 25% if "Inga länkar" or "Länkar borttagna"  
        monitoring: 25, // Bevakning - Always 25% (always active)
        address: 0     // Adresslarm - 25% if active
      };

      // Check site status - same logic as in usePrivacyScore
      const sites = ['Eniro', 'Mrkoll', 'Hitta', 'Merinfo', 'Ratsit', 'Birthday', 'Upplysning'];
      const siteStatusMap = new Map(siteStatuses?.map(s => [s.site_name, s.status]) || []);
      
      const hiddenCount = sites.filter(site => {
        const status = siteStatusMap.get(site);
        return status === 'Dold' || status === 'Kan ej hittas';
      }).length;

      if (hiddenCount === sites.length) {
        scores.sites = 25;
        console.log('All sites are hidden, adding 25 points');
      } else {
        console.log(`Only ${hiddenCount}/${sites.length} sites are hidden`);
      }

      // Check URLs status - same logic as in usePrivacyScore
      if (incomingUrls) {
        const allRemoved = incomingUrls.every(url => url.status === 'removal_approved');
        if (!incomingUrls.length || allRemoved) {
          scores.urls = 25;
          console.log('URLs are complete, adding 25 points');
        } else {
          console.log('URLs not complete:', incomingUrls);
        }
      } else {
        scores.urls = 25; // No URLs is considered complete
        console.log('No URLs found, adding 25 points');
      }

      // Check Address status - same logic as in usePrivacyScore
      if (addressData?.street_address) {
        scores.address = 25;
        console.log('Address is set, adding 25 points');
      } else {
        console.log('No address set');
      }

      const totalScore = scores.sites + scores.urls + scores.monitoring + scores.address;
      console.log('Individual scores:', scores);
      console.log('Final customer score:', totalScore);

      return totalScore;
    },
    enabled: !!customerId
  });

  const calculateScore = () => {
    return customerScore || 0;
  };

  return { calculateScore, isLoading };
};
