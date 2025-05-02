
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl, MonitoringUrlStatus } from "@/types/monitoring-urls";

// Fetch all monitoring URLs (admin view)
export async function fetchAllMonitoringUrls(): Promise<MonitoringUrl[]> {
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

// Fetch monitoring URLs for a specific customer
export async function fetchCustomerMonitoringUrls(customerId: string): Promise<MonitoringUrl[]> {
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

// Add a new monitoring URL
export async function addMonitoringUrl(url: string, customerId: string): Promise<MonitoringUrl> {
  console.log(`Adding monitoring URL for customer: ${customerId}`);
  
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('monitoring_urls')
    .insert({
      url,
      customer_id: customerId,
      admin_user_id: currentUser.user.id,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding monitoring URL:', error);
    throw new Error(`Error adding monitoring URL: ${error.message}`);
  }
  
  return data;
}

// Update monitoring URL status
export async function updateMonitoringUrlStatus(
  urlId: string, 
  status: MonitoringUrlStatus, 
  reason?: string
): Promise<MonitoringUrl> {
  console.log(`Updating monitoring URL status: ${urlId} to ${status}`);
  
  // First, update the status in the monitoring_urls table
  const updateData: { status: MonitoringUrlStatus; reason?: string } = { status };
  
  if (reason) {
    updateData.reason = reason;
  }
  
  const { data, error } = await supabase
    .from('monitoring_urls')
    .update(updateData)
    .eq('id', urlId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating monitoring URL status:', error);
    throw new Error(`Error updating monitoring URL status: ${error.message}`);
  }
  
  // For approved status, we need to notify the admin and create an entry in removal_urls
  // This is now handled by the edge function
  if (status === 'approved' || status === 'rejected') {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser?.user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Calling edge function to handle status change notification');
      
      // Get the URL details
      const url = data.url;
      
      await supabase.functions.invoke('notify-status-change', {
        body: {
          siteName: url,
          newStatus: status,
          language: document.documentElement.lang || 'en',
          userId: currentUser.user.id,
          monitoringUrlId: urlId
        }
      });
    } catch (notifyError: any) {
      console.error('Error notifying admin:', notifyError);
      // We don't want to fail the entire operation if notification fails
    }
  }
  
  return data;
}
