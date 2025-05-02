
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl, MonitoringUrlStatus } from "@/types/monitoring-urls";

// Fetch all monitoring URLs (admin view)
export async function fetchAllMonitoringUrls(): Promise<MonitoringUrl[]> {
  console.log('Fetching all monitoring URLs');
  
  const { data, error } = await supabase
    .from('monitoring_urls')
    .select('*, customer:customers!inner(profiles(display_name, email))')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching monitoring URLs:', error);
    throw new Error(`Error fetching monitoring URLs: ${error.message}`);
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
  
  return data;
}
