
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
      language 
    } = await req.json();

    console.log(`Processing URL status update: ${monitoringUrlId} to ${newStatus} for customer ${customerId}`);
    
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

    // 3. Get user display name for notification
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name, email')
      .eq('id', customerId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // Continue despite this error
    }

    // 4. Create admin notification
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
    }

    // 5. Create additional notification for monitoring approval
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
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
