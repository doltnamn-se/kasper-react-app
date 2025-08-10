
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Create notification for the user and potentially send email
 */
export async function createUserNotification(
  customerId: string, 
  newStatus: string, 
  language: string,
  skipUserEmail: boolean,
  forceEmail?: boolean
) {
  // Normalize status and guard: only notify on approved
  const normalizedStatus = (newStatus || '').toLowerCase().trim();
  if (normalizedStatus !== 'approved') {
    console.log(`Skipping user in-app notification for non-approved status: ${normalizedStatus}`);
    return null;
  }

  // Generate notification message for approved status only
  const notificationTitle = language === 'sv' ? 'Tillagd i länkar' : 'Added to links';
  const notificationMessage = language === 'sv'
    ? 'Länken är mottagen och kommer behandlas inom kort'
    : 'The link has been received and will be processed shortly';

  console.log(`Creating user notification for customer ${customerId} with status ${normalizedStatus}, language: ${language}`);
  console.log(`Skip email: ${skipUserEmail}, Force email: ${forceEmail}`);

  try {
    // Create notification for the user
    const { error: userNotificationError, data: notification } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: customerId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'monitoring',
        read: false
      })
      .select()
      .single();

    if (userNotificationError) {
      console.error("Error creating user notification:", userNotificationError);
      return null;
    }
    
    console.log("Successfully created user notification for status change");
    
    // Process email notification if required
    await sendEmailNotificationIfRequired(
      customerId, 
      notificationTitle, 
      notificationMessage, 
      skipUserEmail,
      forceEmail
    );
    
    return notification;
  } catch (error) {
    console.error("Error in createUserNotification:", error);
    return null;
  }
}

/**
 * Send email notification if user has email notifications enabled
 */
async function sendEmailNotificationIfRequired(
  customerId: string,
  notificationTitle: string,
  notificationMessage: string,
  skipUserEmail: boolean,
  forceEmail?: boolean
) {
  try {
    console.log("Checking if email notification should be sent:", {
      customerId,
      skipUserEmail,
      forceEmail
    });
    
    // Check if user has email notifications enabled
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', customerId)
      .single();
      
    if (prefsError) {
      console.error("Error fetching notification preferences:", prefsError);
      return;
    }
    
    console.log("User notification preferences:", preferences);
    
    // Get user email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', customerId)
      .single();
      
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return;
    }
    
    // ALWAYS send email for admin link status changes - overriding skipUserEmail
    const shouldSkipEmail = skipUserEmail && !forceEmail;
    
    // Only send email if not skipping user email AND (user has email notifications enabled OR forceEmail is set)
    if (!shouldSkipEmail && (preferences?.email_notifications || forceEmail) && profile?.email) {
      console.log("Attempting to send email notification to:", profile.email, {
        emailNotificationsEnabled: preferences?.email_notifications,
        forceEmailFlag: !!forceEmail,
        skipUserEmail: shouldSkipEmail
      });
      
      try {
        // Call the send-notification-email function with explicit project URL
        const emailResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/send-notification-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
              email: profile.email,
              title: notificationTitle,
              message: notificationMessage,
              type: 'monitoring',
              forceEmail: true // Always force email for admin link status changes
            })
          }
        );
        
        // Log the full response for debugging
        const emailResponseText = await emailResponse.text();
        
        if (!emailResponse.ok) {
          console.error("Error response from email function:", emailResponseText);
        } else {
          try {
            const emailData = JSON.parse(emailResponseText);
            console.log("Email sent successfully:", emailData);
          } catch (e) {
            console.log("Email sent successfully. Response text:", emailResponseText);
          }
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
    } else {
      console.log("Email notification skipped:", {
        hasEmail: !!profile?.email,
        emailNotificationsEnabled: preferences?.email_notifications,
        forceEmailFlag: !!forceEmail,
        skipUserEmail: shouldSkipEmail
      });
    }
  } catch (error) {
    console.error("Error in sendEmailNotificationIfRequired:", error);
  }
}
