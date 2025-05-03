
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl } from "@/types/monitoring-urls";

/**
 * Fetch all monitoring URLs (admin view)
 */
export async function fetchAllUrls(): Promise<MonitoringUrl[]> {
  console.log('Fetching all monitoring URLs');
  
  // First, fetch all monitoring URLs without trying to join with customers
  const { data, error } = await supabase
    .from('monitoring_urls')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching monitoring URLs:', error);
    throw new Error(`Error fetching monitoring URLs: ${error.message}`);
  }
  
  // If we have monitoring URLs, fetch customer profile data separately
  if (data && data.length > 0) {
    const monitoringUrlsWithCustomers: MonitoringUrl[] = [];
    
    // Process each URL and fetch its customer data
    for (const url of data) {
      // Fetch the customer profile data
      const { data: customerData, error: customerError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', url.customer_id)
        .single();
      
      if (customerError) {
        console.warn(`Could not fetch customer data for URL ${url.id}:`, customerError);
        // Add the URL without customer data
        monitoringUrlsWithCustomers.push({
          ...url,
          customer: undefined
        });
      } else {
        // Add the URL with customer data
        monitoringUrlsWithCustomers.push({
          ...url,
          customer: {
            profiles: customerData
          }
        });
      }
    }
    
    return monitoringUrlsWithCustomers;
  }
  
  return data || [];
}
