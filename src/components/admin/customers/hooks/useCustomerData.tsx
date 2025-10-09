
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-data', customerId],
    queryFn: async () => {
      if (!customerId) return { customer: null, urls: [], limits: null, checklistProgress: null };
      
      // Fetch all customer data in parallel including the main customer object
      const [customerResponse, urlsResponse, limitsResponse, checklistResponse] = await Promise.all([
        supabase
          .from('customers')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', customerId)
          .maybeSingle(),
        supabase.from('removal_urls').select('*').eq('customer_id', customerId),
        supabase.from('user_url_limits').select('*').eq('customer_id', customerId).maybeSingle(),
        supabase.from('customer_checklist_progress')
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
          .maybeSingle()
      ]);

      // Log responses for debugging
      console.log('Customer Response:', customerResponse);
      console.log('Checklist Response:', checklistResponse);
      console.log('URLs Response:', urlsResponse);
      console.log('Limits Response:', limitsResponse);

      if (customerResponse.error) console.error('Error fetching customer:', customerResponse.error);
      if (urlsResponse.error) console.error('Error fetching URLs:', urlsResponse.error);
      if (limitsResponse.error) console.error('Error fetching limits:', limitsResponse.error);
      if (checklistResponse.error) console.error('Error fetching checklist:', checklistResponse.error);

      return {
        customer: customerResponse.data,
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: checklistResponse.data
      };
    },
    enabled: !!customerId // Only run query if customerId exists
  });
};
