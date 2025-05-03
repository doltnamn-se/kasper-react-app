
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Parse request body
    const { 
      monitoringUrlId, 
      siteName, 
      newStatus, 
      reason, 
      customerId, 
      language,
      forceEmail,
      skipUserEmail
    } = await req.json();

    console.log(`Processing URL status update: ${monitoringUrlId} to ${newStatus} for customer ${customerId}`);
    console.log(`Request details:`, { 
      monitoringUrlId, 
      siteName, 
      newStatus, 
      reason, 
      customerId, 
      language, 
      forceEmail,
      skipUserEmail
    });
    
    if (!monitoringUrlId || !newStatus || !customerId) {
      console.error("Missing required data:", { monitoringUrlId, newStatus, customerId });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Update monitoring URL status
    const { data: updatedUrl, error: updateError } = await supabaseAdmin
      .from('monitoring_urls')
      .update({
        status: newStatus,
        ...(reason ? { reason } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', monitoringUrlId)
      .select('*')
      .single();

    if (updateError) {
      console.error("Error updating monitoring URL:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error updating monitoring URL: ${updateError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Successfully updated monitoring URL status:", updatedUrl);

    // 2. Create a removal URL entry if status is 'approved' and it doesn't already exist
    let removalUrl = null;
    if (newStatus === 'approved') {
      // Check if a removal URL already exists for this URL and customer
      const { data: existingUrl, error: checkError } = await supabaseAdmin
        .from('removal_urls')
        .select('id')
        .eq('customer_id', customerId)
        .eq('url', siteName)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing removal URL:", checkError);
      }

      // Only create a new removal URL if one doesn't exist
      if (!existingUrl) {
        const { data: newRemovalUrl, error: removalError } = await supabaseAdmin
          .from('removal_urls')
          .insert({
            customer_id: customerId,
            url: siteName,
            status: 'received',
            current_status: 'received',
            display_in_incoming: true
          })
          .select()
          .single();

        if (removalError) {
          console.error("Error creating removal URL:", removalError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Error creating removal URL: ${removalError.message}`,
              updatedUrl 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        removalUrl = newRemovalUrl;
        console.log("Successfully created removal URL:", removalUrl);
      } else {
        console.log("Removal URL already exists for this URL, skipping creation");
        removalUrl = existingUrl;
      }
    }

    // 3. Get user display name and email for notification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', customerId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // Continue despite this error
    } else {
      console.log("Found user profile:", profile);
    }

    // 4. Create user notification with explicit notification type for status change
    if (newStatus === 'approved' || newStatus === 'rejected') {
      // Generate notification message based on status
      const notificationTitle = newStatus === 'approved' 
        ? (language === 'sv' ? 'Tillagd i länkar' : 'Added to links')
        : (language === 'sv' ? 'Länk avvisad' : 'Link rejected');
        
      const notificationMessage = newStatus === 'approved'
        ? (language === 'sv' ? 'Länken är mottagen och kommer behandlas inom kort' : 'The link has been received and will be processed shortly')
        : (language === 'sv' ? 'Länken har avvisats från systemet' : 'The link has been rejected from the system');

      // Create notification for the user
      const { error: userNotificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: customerId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'monitoring',
          read: false
        });

      if (userNotificationError) {
        console.error("Error creating user notification:", userNotificationError);
      } else {
        console.log("Successfully created user notification for status change");
        
        // Check if user has email notifications enabled
        const { data: preferences, error: prefsError } = await supabaseAdmin
          .from('notification_preferences')
          .select('email_notifications')
          .eq('user_id', customerId)
          .single();
          
        if (prefsError) {
          console.error("Error fetching notification preferences:", prefsError);
        } else {
          console.log("User notification preferences:", preferences);
        }
        
        // Only send email if we're not skipping user email (admin updates status) 
        // AND (user has email notifications enabled OR forceEmail flag is set)
        if (!skipUserEmail && (preferences?.email_notifications || forceEmail) && profile?.email) {
          // User has email notifications enabled, send email manually
          console.log("Attempting to send email notification to:", profile.email);
          
          try {
            // Call the send-notification-email function directly
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
                  type: 'monitoring'
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
            skipUserEmail: !!skipUserEmail
          });
        }
      }
    }

    // 5. Create admin notification
    const userIdentifier = profile?.display_name || profile?.email || customerId;
    const notificationTitle = language === 'sv' 
      ? 'Status uppdaterad av användare' 
      : 'Status updated by user';
      
    const notificationMessage = language === 'sv' 
      ? `${siteName} status har ändrats till "${newStatus}" av en användare (${userIdentifier})` 
      : `${siteName} status has been changed to "${newStatus}" by a user (${userIdentifier})`;

    // Super admin ID - hardcoded for security
    const SUPER_ADMIN_ID = "a0e63991-d45b-43d4-a8fe-3ecda8c64e9d";
    
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
      // Continue despite this error
    } else {
      console.log("Successfully created notification:", notification);
      
      // Get admin email
      const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', SUPER_ADMIN_ID)
        .single();
        
      if (adminProfileError) {
        console.error("Error fetching admin profile:", adminProfileError);
      } else if (adminProfile?.email) {
        console.log("Attempting to send email notification to admin:", adminProfile.email);
        
        // Send admin email notification
        try {
          // Call the send-notification-email function directly
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
    }

    // 6. Create additional notification for monitoring approval
    let monitoringApprovalNotification = null;
    if (newStatus === 'approved') {
      const approvalTitle = language === 'sv' ? 'URL godkänd av användare' : 'URL approved by user';
      const approvalMessage = language === 'sv' 
        ? 'En bevaknings-URL godkändes av en användare och flyttades till länkhantering'
        : 'A monitoring URL was approved by a user and moved to link management';
      
      const { data: adminNotification, error: approvalNotificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: SUPER_ADMIN_ID,
          title: approvalTitle,
          message: approvalMessage,
          type: 'monitoring_approval',
          read: false
        })
        .select()
        .single();
      
      if (approvalNotificationError) {
        console.error("Error creating monitoring approval notification:", approvalNotificationError);
        // Continue despite this error
      } else {
        monitoringApprovalNotification = adminNotification;
        console.log("Created monitoring approval notification:", adminNotification);
      }
    }

    // Return success with all created/updated data
    return new Response(
      JSON.stringify({
        success: true,
        updatedUrl,
        notification,
        monitoringApprovalNotification,
        removalUrl,
        removalUrlCreated: newStatus === 'approved' && !!removalUrl
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
