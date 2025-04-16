
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

    // Get device tokens for the user
    const { data: tokens, error: tokenError } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", payload.user_id);

    if (tokenError) {
      throw new Error(`Error fetching device tokens: ${tokenError.message}`);
    }

    console.log(`Found ${tokens?.length || 0} device tokens for user ${payload.user_id}`);

    // If there are no tokens, we don't need to send a push notification
    if (!tokens || tokens.length === 0) {
      console.log("No device tokens found, skipping push notification");
      return new Response(
        JSON.stringify({ message: "No device tokens found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Extract just the token strings
    const deviceTokens = tokens.map(t => t.token);

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

    const pushResult = await pushResponse.json();
    console.log("Push notification response:", pushResult);

    return new Response(
      JSON.stringify({ 
        message: "Notification processed",
        pushResult
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
