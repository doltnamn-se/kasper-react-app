
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://upfapfohwnkiugvebujh.supabase.co";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
}

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log("Handling new notification:", payload);

    // Validate payload
    if (!payload.user_id || !payload.title || !payload.message) {
      throw new Error("Invalid notification payload");
    }

    // Get user email and preferences
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", payload.user_id)
      .single();

    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }

    if (!user?.email) {
      throw new Error("User email not found");
    }

    console.log(`Found user email: ${user.email}`);

    // Get notification preferences
    const { data: preferences, error: prefError } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", payload.user_id)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      console.error(`Error fetching notification preferences: ${prefError.message}`);
      // Continue with default preferences
    }

    // Determine if we should send email based on type and preferences
    let shouldSendEmail = preferences?.email_notifications ?? true;
    
    if (payload.type === 'removal') {
      shouldSendEmail = preferences?.email_deindexing ?? true;
    } else if (payload.type === 'monitoring') {
      shouldSendEmail = preferences?.email_monitoring ?? true;
    } else if (payload.type === 'address_alert') {
      shouldSendEmail = preferences?.email_address_alerts ?? true;
    } else if (payload.type === 'news') {
      shouldSendEmail = preferences?.email_news ?? true;
    }

    console.log(`Should send email for type ${payload.type}: ${shouldSendEmail}`);

    // Send email notification if preferences allow
    if (shouldSendEmail) {
      console.log("Sending email notification to:", user.email);
      const emailResponse = await fetch(
        "https://upfapfohwnkiugvebujh.supabase.co/functions/v1/send-notification-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceRoleKey}`,
          },
          body: JSON.stringify({
            email: user.email,
            title: payload.title,
            message: payload.message,
          }),
        }
      );

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Email notification error:", errorText);
        throw new Error(`Email notification failed: ${errorText}`);
      }

      const emailResult = await emailResponse.json();
      console.log("Email notification response:", emailResult);
    }

    // Get device tokens for the user
    const { data: tokens, error: tokenError } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", payload.user_id);

    if (tokenError) {
      console.error(`Error fetching device tokens: ${tokenError.message}`);
    } else {
      console.log(`Found ${tokens?.length || 0} device tokens for user ${payload.user_id}`);

      // If there are tokens, send push notification
      if (tokens && tokens.length > 0) {
        // Extract just the token strings
        const deviceTokens = tokens.map(t => t.token);

        try {
          // Call the send-push-notification function to deliver the notification
          const pushResponse = await fetch(
            "https://upfapfohwnkiugvebujh.supabase.co/functions/v1/send-push-notification",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceRoleKey}`,
              },
              body: JSON.stringify({
                tokens: deviceTokens,
                title: payload.title,
                body: payload.message,
                data: {
                  notificationId: payload.id,
                  type: payload.type,
                },
              }),
            }
          );

          if (!pushResponse.ok) {
            const errorText = await pushResponse.text();
            console.error("Push notification error:", errorText);
          } else {
            const pushResult = await pushResponse.json();
            console.log("Push notification response:", pushResult);
          }
        } catch (pushError) {
          console.error("Error sending push notification:", pushError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Notification processed",
        emailSent: shouldSendEmail,
        pushSent: tokens && tokens.length > 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in handle-new-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
