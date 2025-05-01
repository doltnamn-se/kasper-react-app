
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
        supabase.from('customer_checklist_progress')
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      // Log the raw response and specifically the customer ID being used
      console.log(`Raw customer checklist data for ID ${customerId}:`, checklistResponse);
      console.log('SQL query used:', `customer_checklist_progress where customer_id = ${customerId}`);
      console.log('Response status:', checklistResponse.status);
      console.log('Response error:', checklistResponse.error);
      
      // Get the address directly - no processing, no complications
      const address = checklistResponse.data?.address || null;
      
      console.log('Raw address from database:', address);

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: checklistResponse.data
      };
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
