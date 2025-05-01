
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerAddress = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-address', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log('Fetching address for customer ID:', customerId);
      
      // Use the same approach as the AddressDisplay component's hook
      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('address')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching address:', error);
        return null;
      }

      console.log('Address data fetched directly:', data);
      return data?.address || null;
    },
    enabled: !!customerId
  });
};
