
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerAddress = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-address', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log('Fetching address for customer ID:', customerId);
      
      // Query the customer_checklist_progress table directly for address data
      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('street_address, postal_code, city')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching address:', error);
        return null;
      }

      console.log('Raw address data fetched:', data);
      
      // If we have address data, format it properly
      if (data && data.street_address && data.postal_code && data.city) {
        const formattedAddress = `${data.street_address}, ${data.postal_code} ${data.city}`;
        console.log('Formatted address:', formattedAddress);
        return formattedAddress;
      }
      
      return null;
    },
    enabled: !!customerId
  });
};
