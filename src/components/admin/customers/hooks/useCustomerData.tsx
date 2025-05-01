
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-data', customerId],
    queryFn: async () => {
      if (!customerId) return { urls: [], limits: null, checklistProgress: null };
      
      // Fetch all customer data in parallel
      const [urlsResponse, limitsResponse, checklistResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customerId),
        supabase.from('user_url_limits').select('*').eq('customer_id', customerId).maybeSingle(),
        supabase.from('customer_checklist_progress')
          .select('address, street_address, city, postal_code')
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      // Log responses for debugging
      console.log('Checklist Response:', checklistResponse);
      console.log('URLs Response:', urlsResponse);
      console.log('Limits Response:', limitsResponse);

      if (urlsResponse.error) console.error('Error fetching URLs:', urlsResponse.error);
      if (limitsResponse.error) console.error('Error fetching limits:', limitsResponse.error);
      if (checklistResponse.error) console.error('Error fetching checklist:', checklistResponse.error);

      // Create formatted address from individual fields if available
      let formattedAddress = null;
      if (checklistResponse.data) {
        if (checklistResponse.data.address && typeof checklistResponse.data.address === 'string') {
          formattedAddress = checklistResponse.data.address;
        } else if (checklistResponse.data.street_address) {
          // Create address from individual components
          const addressParts = [
            checklistResponse.data.street_address,
            checklistResponse.data.city,
            checklistResponse.data.postal_code
          ].filter(Boolean);
          
          if (addressParts.length > 0) {
            formattedAddress = addressParts.join(', ');
          }
        }
      }

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: {
          ...checklistResponse.data,
          formattedAddress
        }
      };
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
