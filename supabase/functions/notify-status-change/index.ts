
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
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the request data
    const { siteName, newStatus, language, userId, monitoringUrlId } = await req.json();

    if (!siteName || !newStatus || !userId) {
      console.error("Missing required data:", { siteName, newStatus, userId });
      return new Response(
        JSON.stringify({ error: "Missing required data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated using the JWT in the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure the authenticated user matches the claimed user ID
    if (user.id !== userId) {
      console.error(`User ID mismatch: ${user.id} vs ${userId}`);
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If the status is 'approved', move the URL to removal_urls table
    let monitoringUrl;
    if (newStatus === 'approved' && monitoringUrlId) {
      // First fetch the monitoring URL to get its details
      const { data: urlData, error: urlError } = await supabaseAdmin
        .from('monitoring_urls')
        .select('*')
        .eq('id', monitoringUrlId)
        .single();
        
      if (urlError) {
        console.error("Error fetching monitoring URL:", urlError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch URL details", details: urlError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      monitoringUrl = urlData;
      
      // Create entry in removal_urls table
      const { data: removalUrl, error: removalError } = await supabaseAdmin
        .from('removal_urls')
        .insert({
          customer_id: monitoringUrl.customer_id,
          url: monitoringUrl.url,
          status: 'received',
          current_status: 'received',
          display_in_incoming: true
        })
        .select()
        .single();
      
      if (removalError) {
        console.error("Error creating removal URL:", removalError);
        return new Response(
          JSON.stringify({ error: "Failed to create removal URL", details: removalError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Successfully moved monitoring URL to removal_urls:", removalUrl);
    }

    // Log the request details
    console.log(`Notification request received for site ${siteName} with status ${newStatus}`);
    console.log(`Request from user ID: ${userId}, authenticated as ${user.id}`);

    // Prepare notification content
    const notificationTitle = language === 'sv' 
      ? 'Status uppdaterad av användare' 
      : 'Status updated by user';
      
    const notificationMessage = language === 'sv' 
      ? `${siteName} status har ändrats till "${newStatus}" av en användare` 
      : `${siteName} status has been changed to "${newStatus}" by a user`;

    // Get user display name for better context
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    const userIdentifier = profile?.display_name || profile?.email || user.email || userId;
    const enrichedMessage = `${notificationMessage} (${userIdentifier})`;

    // Create notification for super admin using service role (bypasses RLS)
    console.log(`Creating notification for super admin ${SUPER_ADMIN_ID}: ${enrichedMessage}`);
    
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
      JSON.stringify({ 
        success: true, 
        notification,
        removalUrlCreated: newStatus === 'approved'
      }),
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
