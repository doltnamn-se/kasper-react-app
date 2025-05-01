
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
          .select('*')
          .eq('customer_id', customerId)
          .maybeSingle()
      ]);

      // Log full response data for debugging
      console.log('Customer checklist data:', checklistResponse.data);
      
      // Simply use the address field directly from the customer_checklist_progress table
      const customerAddress = checklistResponse.data?.address || null;
      
      console.log('Direct customer address from database:', customerAddress);

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: {
          ...checklistResponse.data,
          address: customerAddress
        }
      };
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
