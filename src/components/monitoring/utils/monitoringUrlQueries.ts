
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
  
  // Insert the monitoring URL
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
  
  // Create notification for the customer about the new monitoring URL
  if (data) {
    try {
      const notificationTitle = 'Bevakningsalarm';
      const notificationMessage = 'Vår bevakningstjänst har hittat en ny länk';
      
      // Create in-app notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'monitoring',
          read: false
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log('Notification created successfully for monitoring URL');
        
        // Get user email and notification preferences
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', customerId)
          .single();
          
        const { data: preferences, error: prefError } = await supabase
          .from('notification_preferences')
          .select('email_notifications')
          .eq('user_id', customerId)
          .single();
          
        if (!userError && !prefError && userData?.email && preferences?.email_notifications) {
          // Send email notification directly
          console.log('Sending email notification to:', userData.email);
          
          const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
            body: {
              email: userData.email,
              title: notificationTitle,
              message: notificationMessage,
              type: 'monitoring'
            }
          });
          
          if (emailError) {
            console.error('Error sending email notification:', emailError);
          } else {
            console.log('Email notification sent successfully');
          }
        }
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't throw error here, we still want to return the monitoring URL
    }
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
    // First, get the current monitoring URL data to pass to the edge function
    const { data: urlData, error: fetchError } = await supabase
      .from('monitoring_urls')
      .select('*')
      .eq('id', urlId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching monitoring URL details:', fetchError);
      throw new Error(`Error fetching monitoring URL details: ${fetchError.message}`);
    }

    console.log('Found monitoring URL data:', urlData);
    
    // Call the edge function directly to handle all the update operations 
    // with service role privileges
    console.log('Calling edge function to update monitoring URL status');
    const { data: functionResult, error: functionError } = await supabase.functions.invoke('monitoring-url-status', {
      body: {
        monitoringUrlId: urlId,
        siteName: urlData.url,
        newStatus: status,
        reason: reason || null,
        customerId: urlData.customer_id,
        language: document.documentElement.lang || 'en'
      }
    });
    
    if (functionError) {
      console.error('Error from edge function:', functionError);
      throw new Error(`Error from edge function: ${functionError.message}`);
    }
    
    console.log('Edge function response:', functionResult);
    
    // Check if the function reports success
    if (!functionResult.success) {
      throw new Error(functionResult.error || 'Unknown error from edge function');
    }
    
    // Don't attempt to update the URL status directly here
    // The edge function has already done that with admin privileges
    
    // For approved URLs, invalidate queries related to incoming URLs to refresh the UI
    if (status === 'approved') {
      await queryClient?.invalidateQueries({ queryKey: ['incoming-urls'] });
      await queryClient?.invalidateQueries({ queryKey: ['admin-urls'] });
    }
    
    return functionResult.updatedUrl;
  } catch (error: any) {
    console.error('Error in updateMonitoringUrlStatus:', error);
    throw error; // Re-throw for the caller to handle
  }
}

// Temporary variable to reference the queryClient
// This will be set by useMonitoringUrls hook
let queryClient: any = null;

// Function to set the queryClient reference for use in updateMonitoringUrlStatus
export function setQueryClientReference(client: any) {
  queryClient = client;
}
