
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl } from "@/types/monitoring-urls";

/**
 * Fetch monitoring URLs for a specific customer
 */
export async function fetchCustomerUrls(customerId: string): Promise<MonitoringUrl[]> {
  console.log(`Fetching monitoring URLs for customer: ${customerId}`);
  
  const { data, error } = await supabase
    .from('monitoring_urls')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching customer monitoring URLs:', error);
    throw new Error(`Error fetching customer monitoring URLs: ${error.message}`);
  }
  
  return data || [];
}
