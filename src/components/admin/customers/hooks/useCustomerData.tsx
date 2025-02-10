
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerWithProfile } from "@/types/customer";

export const useCustomerData = (customer: CustomerWithProfile | null) => {
  return useQuery({
    queryKey: ['customer-data', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return { urls: [], limits: null, checklistProgress: null };
      
      const [urlsResponse, limitsResponse, checklistResponse] = await Promise.all([
        supabase.from('removal_urls').select('*').eq('customer_id', customer.id),
        supabase.from('user_url_limits').select('*').eq('customer_id', customer.id).maybeSingle(),
        supabase.from('customer_checklist_progress').select('*').eq('customer_id', customer.id).maybeSingle()
      ]);

      return {
        urls: urlsResponse.data || [],
        limits: limitsResponse.data,
        checklistProgress: checklistResponse.data
      };
    },
    enabled: !!customer?.id
  });
};
