
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-data', customerId],
    queryFn: async () => {
      if (!customerId) return { urls: [], limits: null, checklistProgress: null };
      
      // Debug the customerId we're using for the query
      console.log('Fetching data for customer ID:', customerId);
      
      // Fetch all customer data in parallel
      const [urlsResponse, limitsResponse, checklistResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customerId),
        supabase.from('user_url_limits').select('*').eq('customer_id', customerId).maybeSingle(),
        supabase
          .from('customer_checklist_progress')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      // Log the raw response data to see exactly what we're getting back
      console.log('Raw customer data responses:');
      console.log('URLs response:', urlsResponse);
      console.log('Limits response:', limitsResponse);
      console.log('Checklist response:', checklistResponse);
      
      // Explicitly check if we have address data and log it
      const addressData = checklistResponse.data?.address;
      console.log('Address data from database:', addressData);
      
      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: checklistResponse.data
      };
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
