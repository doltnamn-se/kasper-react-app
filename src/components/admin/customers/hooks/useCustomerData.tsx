
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-data', customerId],
    queryFn: async () => {
      if (!customerId) return { urls: [], limits: null, checklistProgress: null };
      
      console.log('Fetching customer data for ID:', customerId);
      
      try {
        // Fetch all customer data in parallel using separate try/catch blocks to prevent one failure from affecting others
        const urlsPromise = supabase.from('removal_urls').select('*').eq('customer_id', customerId);
        const limitsPromise = supabase.from('user_url_limits').select('*').eq('customer_id', customerId).maybeSingle();
        
        // Try to get address directly from profiles instead of customer_checklist_progress
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Execute all promises in parallel
        const [urlsResponse, limitsResponse, profileResponse] = await Promise.all([
          urlsPromise, 
          limitsPromise, 
          profilePromise
        ]);

        // Log responses for debugging
        console.log('Profile Response:', profileResponse);
        console.log('URLs Response:', urlsResponse);
        console.log('Limits Response:', limitsResponse);

        if (urlsResponse.error) console.error('Error fetching URLs:', urlsResponse.error);
        if (limitsResponse.error) console.error('Error fetching limits:', limitsResponse.error);
        if (profileResponse.error) console.error('Error fetching profile:', profileResponse.error);

        // As a fallback, try to fetch from checklist_progress if address is not in profile
        let checklistData = null;
        if (!profileResponse.data || !profileResponse.data.address) {
          console.log('Address not found in profile, attempting to fetch from checklist_progress');
          const checklistResponse = await supabase
            .from('customer_checklist_progress')
            .select(`
              password_updated,
              removal_urls,
              selected_sites,
              street_address,
              postal_code,
              city,
              address,
              completed_at
            `)
            .eq('customer_id', customerId)
            .maybeSingle();
            
          console.log('Checklist Response:', checklistResponse);
          checklistData = checklistResponse.data;
          
          if (checklistResponse.data) {
            console.log('Address from checklist data:', checklistResponse.data.address);
          } else {
            console.log('No checklist data found for customer');
          }
        }

        return {
          urls: urlsResponse.data || [],
          limits: limitsResponse.data,
          checklistProgress: checklistData,
          profile: profileResponse.data
        };
      } catch (error) {
        console.error('Unexpected error in useCustomerData:', error);
        throw error;
      }
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
