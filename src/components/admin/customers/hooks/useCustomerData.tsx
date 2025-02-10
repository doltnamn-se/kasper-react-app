
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customer: CustomerWithProfile | null) => {
  return useQuery({
    queryKey: ['customer-data', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return { urls: [], limits: null, checklistProgress: null };
      
      // Fetch all customer data in parallel
      const [urlsResponse, limitsResponse, checklistResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customer.id),
        supabase.from('user_url_limits').select('*').eq('customer_id', customer.id).maybeSingle(),
        supabase.from('customer_checklist_progress')
          .select(`
            password_updated,
            removal_urls,
            selected_sites,
            street_address,
            postal_code,
            city,
            completed_at
          `)
          .eq('customer_id', customer.id)
          .maybeSingle()
      ]);

      // Log responses for debugging
      console.log('Checklist Response:', checklistResponse);
      console.log('URLs Response:', urlsResponse);
      console.log('Limits Response:', limitsResponse);

      if (urlsResponse.error) console.error('Error fetching URLs:', urlsResponse.error);
      if (limitsResponse.error) console.error('Error fetching limits:', limitsResponse.error);
      if (checklistResponse.error) console.error('Error fetching checklist:', checklistResponse.error);

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: checklistResponse.data
      };
    },
    enabled: !!customer?.id
  });
};
