
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerAddress = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-address', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      console.log('Fetching address for customer ID:', customerId);
      
      // First, check if we have direct access to the customer_checklist_progress table
      const { data: accessCheck, error: accessError } = await supabase
        .from('customer_checklist_progress')
        .select('count(*)')
        .limit(1);
        
      if (accessError) {
        console.error('Potential permission issue accessing customer_checklist_progress:', accessError);
      } else {
        console.log('Successfully accessed customer_checklist_progress table');
      }
      
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
      
      // Try fetching directly from the customer if possible
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', customerId)
          .maybeSingle();
          
        if (customerError) {
          console.error('Error checking customer:', customerError);
        } else {
          console.log('Customer exists in database:', customerData);
        }
      } catch (err) {
        console.error('Error in customer check:', err);
      }
      
      return null;
    },
    enabled: !!customerId
  });
};
