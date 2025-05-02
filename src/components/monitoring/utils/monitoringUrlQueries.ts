
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
  
  try {
    // First, update the status in the monitoring_urls table
    const { data, error } = await supabase
      .from('monitoring_urls')
      .update({ status, ...(reason ? { reason } : {}) })
      .eq('id', urlId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating monitoring URL status:', error);
      throw new Error(`Error updating monitoring URL status: ${error.message}`);
    }
    
    // Only invoke the edge function for approved or rejected status
    if (status === 'approved' || status === 'rejected') {
      try {
        const { data: currentUser } = await supabase.auth.getUser();
        
        if (!currentUser?.user) {
          throw new Error('User not authenticated');
        }
        
        console.log('Calling edge function to handle status change notification');
        
        // Call the edge function to handle notifications and removal_url creation
        const { data: functionResult, error: functionError } = await supabase.functions.invoke('notify-status-change', {
          body: {
            siteName: data.url,
            newStatus: status,
            language: document.documentElement.lang || 'en',
            userId: currentUser.user.id,
            monitoringUrlId: urlId
          }
        });
        
        if (functionError) {
          console.error('Error from edge function:', functionError);
          // Don't throw here - we want to continue regardless
        } else {
          console.log('Edge function response:', functionResult);
        }
      } catch (notifyError) {
        console.error('Error calling edge function:', notifyError);
        // We don't want to fail the entire operation if the edge function call fails
        // The status update was successful, so we still proceed
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Error in updateMonitoringUrlStatus:', error);
    throw error; // Re-throw for the caller to handle
  }
}
