
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Super admin ID - hardcoded for security
const SUPER_ADMIN_ID = "a0e63991-d45b-43d4-a8fe-3ecda8c64e9d";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    // Important: Using service role to bypass RLS policies
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create a standard client to verify the request
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get the request data
    const { siteName, newStatus, language, userId } = await req.json();

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the request details
    console.log(`Notification request received for site ${siteName} with status ${newStatus}`);
    console.log(`Request from user ID: ${userId}, authenticated as ${user.id}`);

    // Ensure the authenticated user matches the claimed user ID
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare notification content
    const notificationTitle = language === 'sv' 
      ? 'Status uppdaterad av användare' 
      : 'Status updated by user';
      
    const notificationMessage = language === 'sv' 
      ? `${siteName} status har ändrats till "${newStatus}" av en användare` 
      : `${siteName} status has been changed to "${newStatus}" by a user`;

    // Get user display name for better context
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', userId)
      .single();

    const userIdentifier = profile?.display_name || profile?.email || user.email || userId;
    const enrichedMessage = `${notificationMessage} (${userIdentifier})`;

    // Create notification for super admin using service role (bypasses RLS)
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: SUPER_ADMIN_ID,
        title: notificationTitle,
        message: enrichedMessage,
        type: 'status_change'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating notification:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create notification", details: insertError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Notification created successfully:", notification);

    return new Response(
      JSON.stringify({ success: true, notification }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
