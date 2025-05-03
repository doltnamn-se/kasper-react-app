
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
    const { 
      monitoringUrlId, 
      siteName, 
      newStatus, 
      reason,
      language, 
      customerId 
    } = await req.json();

    if (!siteName || !newStatus || !customerId) {
      console.error("Missing required data:", { siteName, newStatus, customerId });
      return new Response(
        JSON.stringify({ error: "Missing required data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First, verify if the monitoring URL exists and has the status provided
    // This verifies if the client-side update went through
    if (monitoringUrlId) {
      const { data: monitoringUrl, error: urlError } = await supabaseAdmin
        .from('monitoring_urls')
        .select('*')
        .eq('id', monitoringUrlId)
        .single();

      if (urlError) {
        console.error("Error fetching monitoring URL:", urlError);
        return new Response(
          JSON.stringify({ error: "Monitoring URL not found", details: urlError }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Found monitoring URL: ${monitoringUrl.id} with status: ${monitoringUrl.status}`);
    }

    // If the status is 'approved', move the URL to removal_urls table
    let monitoringUrl;
    let removalUrl;
    if (newStatus === 'approved' && monitoringUrlId && customerId) {
      console.log(`Processing approval for URL ${monitoringUrlId} from customer ${customerId}`);
      
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
      console.log("Found monitoring URL:", monitoringUrl);
      
      // Create entry in removal_urls table
      const { data: newRemovalUrl, error: removalError } = await supabaseAdmin
        .from('removal_urls')
        .insert({
          customer_id: customerId,
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
      
      removalUrl = newRemovalUrl;
      console.log("Successfully created removal URL:", removalUrl);
    }

    // Log the request details
    console.log(`Notification request received for site ${siteName} with status ${newStatus}`);
    console.log(`Request for customer ID: ${customerId}`);

    // Get user display name for better context
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', customerId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    // Prepare notification content
    const notificationTitle = language === 'sv' 
      ? 'Status uppdaterad av användare' 
      : 'Status updated by user';
      
    const userIdentifier = profile?.display_name || profile?.email || customerId;
    const notificationMessage = language === 'sv' 
      ? `${siteName} status har ändrats till "${newStatus}" av en användare (${userIdentifier})` 
      : `${siteName} status has been changed to "${newStatus}" by a user (${userIdentifier})`;

    // Create notification for super admin using service role (bypasses RLS)
    console.log(`Creating notification for super admin ${SUPER_ADMIN_ID}: ${notificationMessage}`);
    
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: SUPER_ADMIN_ID,
        title: notificationTitle,
        message: notificationMessage,
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

    // Create notification for monitoring approval if applicable
    let monitoringApprovalNotification = null;
    if (newStatus === 'approved' && monitoringUrlId) {
      const monitoringTitle = language === 'sv' ? 'URL godkänd av användare' : 'URL approved by user';
      const monitoringMessage = language === 'sv' 
        ? 'En bevaknings-URL godkändes av en användare och flyttades till länkhantering'
        : 'A monitoring URL was approved by a user and moved to link management';
      
      const { data: adminNotification, error: adminNotifyError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: SUPER_ADMIN_ID,
          title: monitoringTitle,
          message: monitoringMessage,
          type: 'monitoring_approval',
          read: false
        })
        .select()
        .single();
      
      if (adminNotifyError) {
        console.error("Error creating monitoring approval notification:", adminNotifyError);
      } else {
        monitoringApprovalNotification = adminNotification;
        console.log("Created monitoring approval notification:", adminNotification);
      }
    }

    console.log("Notification created successfully:", notification);

    return new Response(
      JSON.stringify({ 
        success: true, 
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
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
