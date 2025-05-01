
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
          .select('*')  // Select all fields to ensure we get everything
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      // Log full response data for debugging
      console.log('Full Checklist Response:', checklistResponse);
      
      // Create formatted address from available data
      let formattedAddress = null;
      
      if (checklistResponse.data) {
        // Try different address fields based on what's available
        if (checklistResponse.data.address && typeof checklistResponse.data.address === 'string' && checklistResponse.data.address.trim() !== '') {
          console.log('Using full address field:', checklistResponse.data.address);
          formattedAddress = checklistResponse.data.address.trim();
        } 
        // Fall back to constructing from parts if main address is empty/null
        else if (checklistResponse.data.street_address || checklistResponse.data.city || checklistResponse.data.postal_code) {
          const addressParts = [
            checklistResponse.data.street_address,
            checklistResponse.data.city,
            checklistResponse.data.postal_code
          ].filter(Boolean);
          
          if (addressParts.length > 0) {
            formattedAddress = addressParts.join(', ');
            console.log('Constructed address from parts:', formattedAddress);
          }
        }
      }

      console.log('Final formatted address:', formattedAddress);

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
