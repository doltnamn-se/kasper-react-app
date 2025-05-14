
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { siteName, newStatus, language, userId } = await req.json();
    
    console.log(`Notify status change: ${siteName} changed to ${newStatus} by user ${userId}`);
    
    if (!siteName || !newStatus || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Supabase client with admin privileges
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Super admin ID - hardcoded for security
    const SUPER_ADMIN_ID = "a0e63991-d45b-43d4-a8fe-3ecda8c64e9d";
    
    // Get user's display name for the notification
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: profileError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const displayName = profileData?.display_name || "A user";
    
    // Create notification title and message based on language
    const notificationTitle = language === 'sv' 
      ? `Statusuppdatering för ${siteName}` 
      : `Status update for ${siteName}`;
    
    const notificationMessage = language === 'sv'
      ? `${displayName} har ändrat status för ${siteName} till "${newStatus}"`
      : `${displayName} changed the status of ${siteName} to "${newStatus}"`;
    
    // Create the notification for admin
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: notificationError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log("Successfully created notification:", notification);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        notification 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in notify-status-change function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
