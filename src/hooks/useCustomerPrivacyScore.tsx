
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrivacyScore } from "./usePrivacyScore";

// Create a hook that fetches the customer's data and calculates their score
// using the exact same logic the user sees
const useCustomerPrivacyScoreWithData = (customerId: string) => {
  // Fetch all the data the user's privacy score calculation needs
  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customer-privacy-data', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log('Fetching all customer data for privacy score:', customerId);
      
      // Get incoming URLs (same as useIncomingUrls)
      const { data: incomingUrls } = await supabase
        .from('removal_urls')
        .select(`
          id,
          url,
          status,
          created_at,
          status_history
        `)
        .eq('customer_id', customerId)
        .eq('display_in_incoming', true)
        .order('created_at', { ascending: false });

      // Get address data (same as useAddressData)
      const { data: addressData } = await supabase
        .from('customer_checklist_progress')
        .select('street_address')
        .eq('customer_id', customerId)
        .maybeSingle();

      // Get site statuses (same as useSiteStatuses)
      const { data: siteStatuses } = await supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', customerId);

      // Get user profile (same as useUserProfile)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

      console.log('Fetched customer data:', {
        incomingUrls: incomingUrls?.length || 0,
        addressData,
        siteStatuses: siteStatuses?.length || 0,
        profileData
      });

      return {
        incomingUrls,
        addressData,
        siteStatuses,
        profileData
      };
    },
    enabled: !!customerId
  });

  return { customerData, isLoading };
};

export const useCustomerPrivacyScore = (customerId: string) => {
  const { customerData, isLoading } = useCustomerPrivacyScoreWithData(customerId);
  
  const calculateScore = () => {
    if (!customerData) return 0;
    
    console.log('Calculating score with customer data for admin:', customerId);
    
    // Use the same logic as the user's usePrivacyScore hook
    // This mimics the calculation from usePrivacyScore but with the customer's data
    
    let scores = {
      sites: 0,      // Upplysningssidor - 25% if "Dold"
      urls: 0,       // Länkar - 25% if "Inga länkar" or "Länkar borttagna"  
      monitoring: 25, // Bevakning - Always 25% (always active)
      address: 0     // Adresslarm - 25% if active
    };

    // Check site status - using the same logic as useSiteStatusBadge
    const sites = ['Eniro', 'Mrkoll', 'Hitta', 'Merinfo', 'Ratsit', 'Birthday', 'Upplysning'];
    const siteStatusMap = new Map(customerData.siteStatuses?.map(s => [s.site_name, s.status]) || []);
    
    const hiddenCount = sites.filter(site => {
      const status = siteStatusMap.get(site);
      return status === 'Dold' || status === 'Kan ej hittas';
    }).length;

    // This should match the logic in useSiteStatusBadge that determines "green" status
    if (hiddenCount === sites.length) {
      scores.sites = 25;
      console.log('All sites are hidden, adding 25 points');
    } else {
      console.log(`Only ${hiddenCount}/${sites.length} sites are hidden`);
    }

    // Check URLs status - same logic as in usePrivacyScore
    if (customerData.incomingUrls) {
      const allRemoved = customerData.incomingUrls.every(url => url.status === 'removal_approved');
      if (!customerData.incomingUrls.length || allRemoved) {
        scores.urls = 25;
        console.log('URLs are complete, adding 25 points');
      } else {
        console.log('URLs not complete:', customerData.incomingUrls);
      }
    } else {
      scores.urls = 25; // No URLs is considered complete
      console.log('No URLs found, adding 25 points');
    }

    // Check Address status - same logic as in usePrivacyScore
    if (customerData.addressData?.street_address) {
      scores.address = 25;
      console.log('Address is set, adding 25 points');
    } else {
      console.log('No address set');
    }

    const totalScore = scores.sites + scores.urls + scores.monitoring + scores.address;
    console.log('Admin calculated score breakdown:', scores);
    console.log('Admin calculated total score:', totalScore);

    return totalScore;
  };

  return { calculateScore, isLoading };
};
