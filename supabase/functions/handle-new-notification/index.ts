
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
  console.log("sendPushNotification called with notification:", notification);
  
  // Create Supabase client using service role key
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  
  console.log("Creating Supabase client with URL:", supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get the user's device tokens
    console.log("Fetching device tokens for user:", notification.user_id);
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
    console.log("Token samples:", tokenList.map(t => t.substring(0, 10) + "..."));
    
    // Invoke the send-push-notification function
    console.log("Invoking send-push-notification function with tokens");
    const { data: response, error: functionError } = await supabase.functions.invoke(
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
    
    if (functionError) {
      console.error("Error from send-push-notification:", functionError);
      return { success: false, error: functionError };
    }
    
    console.log("Push notification sent successfully:", response);
    return { success: true, data: response };
  } catch (error) {
    console.error("Error in sendPushNotification:", error);
    return { success: false, error };
  }
}

const handler = async (req: Request) => {
  console.log("Received request to handle-new-notification function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification: Notification = await req.json();
    console.log("Processing notification:", notification);
    
    if (!notification.user_id || !notification.title || !notification.message) {
      console.error("Missing required fields in notification payload:", notification);
      throw new Error("Missing required fields in notification payload");
    }
    
    console.log("Calling sendPushNotification function");
    const result = await sendPushNotification(notification);
    console.log("sendPushNotification result:", result);
    
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
