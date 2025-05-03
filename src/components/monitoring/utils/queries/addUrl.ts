
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
        
        // Send email notification if enabled
        await sendEmailNotificationIfEnabled(
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
 * Send email notification if user has enabled email notifications
 */
async function sendEmailNotificationIfEnabled(
  customerId: string, 
  notificationTitle: string, 
  notificationMessage: string
) {
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
    // Log details before sending email
    console.log('Email notification eligible:', {
      email: userData.email,
      emailNotificationsEnabled: preferences.email_notifications
    });
    
    // Send email notification directly with extra logging
    console.log('Attempting to send email notification to:', userData.email);
    
    try {
      const emailResponse = await supabase.functions.invoke('send-notification-email', {
        body: {
          email: userData.email,
          title: notificationTitle,
          message: notificationMessage,
          type: 'monitoring',
          isAdminAddedLink: true // Add a flag to indicate this is an admin-added link
        }
      });
      
      console.log('Email function response:', emailResponse);
      
      if (emailResponse.error) {
        console.error('Error from email function:', emailResponse.error);
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (emailErr) {
      console.error('Exception sending email notification:', emailErr);
    }
  } else {
    console.log('Email notification skipped:', {
      hasUserData: !!userData,
      hasEmail: !!userData?.email,
      emailNotificationsEnabled: preferences?.email_notifications
    });
  }
}
