
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Super admin ID - hardcoded for security
const SUPER_ADMIN_ID = "a0e63991-d45b-43d4-a8fe-3ecda8c64e9d";

/**
 * Create notification for admins about URL status changes
 */
export async function createAdminNotification(
  siteName: string, 
  newStatus: string, 
  customerId: string, 
  language: string
) {
  try {
    // Get user profile data for the notification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', customerId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // Continue despite this error with default identifier
    }
    
    const userIdentifier = profile?.display_name || profile?.email || customerId;
    const notificationTitle = language === 'sv' 
      ? 'Status uppdaterad av användare' 
      : 'Status updated by user';
      
    const notificationMessage = language === 'sv' 
      ? `${siteName} status har ändrats till "${newStatus}" av en användare (${userIdentifier})` 
      : `${siteName} status has been changed to "${newStatus}" by a user (${userIdentifier})`;

    // Create notification for admin
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: SUPER_ADMIN_ID,
        title: notificationTitle,
        message: notificationMessage,
        type: 'status_change',
        read: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      return null;
    }
    
    console.log("Successfully created admin notification:", notification);
    
    // Send admin email notification
    await sendAdminEmailNotification(notificationTitle, notificationMessage);
    
    return notification;
  } catch (error) {
    console.error("Error in createAdminNotification:", error);
    return null;
  }
}

/**
 * Send email notification to admin
 */
async function sendAdminEmailNotification(notificationTitle: string, notificationMessage: string) {
  try {
    // Get admin email
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', SUPER_ADMIN_ID)
      .single();
      
    if (adminProfileError) {
      console.error("Error fetching admin profile:", adminProfileError);
      return;
    }
    
    if (adminProfile?.email) {
      console.log("Attempting to send email notification to admin:", adminProfile.email);
      
      // Send admin email notification
      try {
        const emailResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/send-notification-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              email: adminProfile.email,
              title: notificationTitle,
              message: notificationMessage,
              type: 'monitoring_admin'
            })
          }
        );
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("Error response from email function for admin:", errorText);
        } else {
          const emailData = await emailResponse.json();
          console.log("Admin email sent successfully:", emailData);
        }
      } catch (emailError) {
        console.error("Error sending admin email notification:", emailError);
      }
    }
  } catch (error) {
    console.error("Error sending admin email notification:", error);
  }
}
