
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
}

async function sendPushNotification(notification: Notification) {
  // Create Supabase client using service role key
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get the user's device tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", notification.user_id);
      
    if (tokensError) {
      console.error("Error fetching device tokens:", tokensError);
      return { success: false, error: tokensError };
    }
    
    if (!tokens || tokens.length === 0) {
      console.log("No device tokens found for user:", notification.user_id);
      return { success: false, error: "No device tokens found" };
    }
    
    // Get the tokens as an array of strings
    const tokenList = tokens.map(t => t.token);
    console.log(`Found ${tokenList.length} device tokens for user:`, notification.user_id);
    
    // Invoke the send-push-notification function
    const response = await supabase.functions.invoke(
      "send-push-notification",
      {
        body: {
          tokens: tokenList,
          title: notification.title,
          body: notification.message,
          data: {
            type: notification.type,
            notificationId: notification.id
          }
        }
      }
    );
    
    if (response.error) {
      console.error("Error sending push notification:", response.error);
      return { success: false, error: response.error };
    }
    
    console.log("Push notification sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
    return { success: false, error };
  }
}

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: Notification = await req.json();
    console.log("Processing notification:", notification);
    
    if (!notification.user_id || !notification.title || !notification.message) {
      throw new Error("Missing required fields in notification payload");
    }
    
    const result = await sendPushNotification(notification);
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: result.success ? 200 : 500,
      }
    );
  } catch (error) {
    console.error("Error in handle-new-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
