
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl } from "@/types/monitoring-urls";

/**
 * Add a new monitoring URL
 */
export async function addUrl(url: string, customerId: string): Promise<MonitoringUrl> {
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
  
  // This is the case where an admin adds a monitoring URL for a customer
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
        
        // Always send email notification for admin-added monitoring URLs with forceEmail=true
        await sendEmailNotificationForAdminAddedUrl(
          customerId, 
          notificationTitle, 
          notificationMessage
        );
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't throw error here, we still want to return the monitoring URL
    }
  }
  
  return data;
}

/**
 * Send email notification for admin-added monitoring URLs
 * This is separate from the regular notification flow and should always send an email
 */
async function sendEmailNotificationForAdminAddedUrl(
  customerId: string, 
  notificationTitle: string, 
  notificationMessage: string
) {
  // Get user email (don't need to check preferences - always send for admin-added URLs)
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', customerId)
    .single();
    
  if (userError || !userData?.email) {
    console.error('Error fetching user email:', userError);
    return;
  }
    
  // Log details before sending email
  console.log('Sending admin-added monitoring URL email notification to:', userData.email);
  
  try {
    // Call edge function to send email with forceEmail=true to ensure delivery
    const emailResponse = await supabase.functions.invoke('send-notification-email', {
      body: {
        email: userData.email,
        title: notificationTitle,
        message: notificationMessage,
        type: 'monitoring',
        isAdminAddedLink: true,
        forceEmail: true
      }
    });
    
    console.log('Email function response:', emailResponse);
    
    if (emailResponse.error) {
      console.error('Error from email function:', emailResponse.error);
    } else {
      console.log('Email notification sent successfully for admin-added URL');
    }
  } catch (emailErr) {
    console.error('Exception sending email notification for admin-added URL:', emailErr);
  }
}
